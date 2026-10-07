package handlers

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"math"
	"mime"
	"mime/multipart"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/mrez09/AJS/models"
)

const (
	maxProductImageSize   int64 = 5 << 20
	productImageURLPrefix       = "/uploads/"
)

var uploadedImageNamePattern = regexp.MustCompile(`^[a-f0-9]{32}\.(jpg|png)$`)
var errProductImageTooLarge = errors.New("Image is too large; maximum size is 5 MB")

type productUpdateValidationError string

func (err productUpdateValidationError) Error() string { return string(err) }

type UpdateProductRequest struct {
	AvailableQuantity float64 `json:"available_quantity"`
	Status            string  `json:"status"`
}

// ProductEditRequest uses pointers so the existing stock/status-only JSON
// request remains a compatible partial update.
type ProductEditRequest struct {
	Name              *string  `json:"name"`
	Origin            *string  `json:"origin"`
	Grade             *string  `json:"grade"`
	Condition         *string  `json:"condition"`
	AvailableQuantity *float64 `json:"available_quantity"`
	MOQ               *float64 `json:"moq"`
	Description       *string  `json:"description"`
	Status            *string  `json:"status"`
}

type CreateProductRequest struct {
	Name              string  `json:"name"`
	Origin            string  `json:"origin"`
	Grade             string  `json:"grade"`
	Condition         string  `json:"condition"`
	AvailableQuantity float64 `json:"available_quantity"`
	MOQ               float64 `json:"moq"`
	Description       string  `json:"description"`
	Image             string  `json:"image"`
	Status            string  `json:"status"`
}

func UpdateProduct(db *gorm.DB, uploadDirs ...string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idString := r.PathValue("id")

		id, err := strconv.ParseUint(idString, 10, 32)
		if err != nil {
			http.Error(w, "Invalid product ID", http.StatusBadRequest)
			return
		}

		var request ProductEditRequest
		var imageFile *multipart.FileHeader
		mediaType, _, _ := mime.ParseMediaType(r.Header.Get("Content-Type"))
		if mediaType == "multipart/form-data" {
			r.Body = http.MaxBytesReader(w, r.Body, maxProductImageSize+(1<<20))
			if err := r.ParseMultipartForm(1 << 20); err != nil {
				if r.MultipartForm != nil {
					_ = r.MultipartForm.RemoveAll()
				}
				var maxBytesErr *http.MaxBytesError
				if errors.As(err, &maxBytesErr) {
					http.Error(w, "Image upload is too large; maximum size is 5 MB", http.StatusRequestEntityTooLarge)
				} else {
					http.Error(w, "Invalid multipart form", http.StatusBadRequest)
				}
				return
			}
			defer r.MultipartForm.RemoveAll()
			request, err = productEditRequestFromForm(r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			files := r.MultipartForm.File["image_file"]
			if len(files) > 1 {
				http.Error(w, "Only one image file may be uploaded", http.StatusBadRequest)
				return
			}
			if len(files) == 1 {
				imageFile = files[0]
			}
		} else if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		storedImagePath := ""
		newImageURL := ""
		if imageFile != nil {
			data, extension, err := readProductImage(imageFile)
			if err != nil {
				status := http.StatusBadRequest
				if errors.Is(err, errProductImageTooLarge) {
					status = http.StatusRequestEntityTooLarge
				}
				http.Error(w, err.Error(), status)
				return
			}
			dir := ""
			if len(uploadDirs) > 0 {
				dir = uploadDirs[0]
			}
			newImageURL, storedImagePath, err = saveProductImage(dir, data, extension)
			if err != nil {
				http.Error(w, "Failed to store uploaded image", http.StatusInternalServerError)
				return
			}
		}

		var product models.Product
		err = db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&product, uint(id)).Error; err != nil {
				return err
			}
			updates := make(map[string]interface{})
			if request.Name != nil {
				product.Name = strings.TrimSpace(*request.Name)
				updates["name"] = product.Name
			}
			if request.Origin != nil {
				product.Origin = strings.TrimSpace(*request.Origin)
				updates["origin"] = product.Origin
			}
			if request.Grade != nil {
				product.Grade = strings.TrimSpace(*request.Grade)
				updates["grade"] = product.Grade
			}
			if request.Condition != nil {
				product.Condition = strings.TrimSpace(*request.Condition)
				updates["condition"] = product.Condition
			}
			if request.AvailableQuantity != nil {
				product.AvailableQuantity = *request.AvailableQuantity
				updates["available_quantity"] = product.AvailableQuantity
			}
			if request.MOQ != nil {
				product.MOQ = *request.MOQ
				updates["moq"] = product.MOQ
			}
			if request.Description != nil {
				product.Description = *request.Description
				updates["description"] = product.Description
			}
			if request.Status != nil {
				product.Status = *request.Status
				updates["status"] = product.Status
			}
			if storedImagePath != "" {
				product.Image = newImageURL
				updates["image"] = newImageURL
			}
			if len(updates) == 0 {
				return productUpdateValidationError("No product fields were provided")
			}
			if strings.TrimSpace(product.Name) == "" {
				return productUpdateValidationError("Product name is required")
			}
			if math.IsNaN(product.AvailableQuantity) || math.IsInf(product.AvailableQuantity, 0) || product.AvailableQuantity < 0 {
				return productUpdateValidationError("Available quantity must be a non-negative number")
			}
			if math.IsNaN(product.MOQ) || math.IsInf(product.MOQ, 0) || product.MOQ < 0 {
				return productUpdateValidationError("MOQ must be a non-negative number")
			}
			if product.Status != "Available" && product.Status != "Unavailable" {
				return productUpdateValidationError("Status must be Available or Unavailable")
			}
			result := tx.Model(&product).Updates(updates)
			if result.Error != nil {
				return result.Error
			}
			if result.RowsAffected == 0 {
				return gorm.ErrRecordNotFound
			}
			return nil
		})
		if err != nil {
			if storedImagePath != "" {
				_ = os.Remove(storedImagePath)
			}
			if err == gorm.ErrRecordNotFound {
				http.Error(w, "Product not found", http.StatusNotFound)
				return
			}
			var validationErr productUpdateValidationError
			if errors.As(err, &validationErr) {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			http.Error(w, "Failed to update product", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(product)
	}

}

func productEditRequestFromForm(r *http.Request) (ProductEditRequest, error) {
	available, err := strconv.ParseFloat(r.FormValue("available_quantity"), 64)
	if err != nil || math.IsNaN(available) || math.IsInf(available, 0) {
		return ProductEditRequest{}, errors.New("Available quantity must be a number")
	}
	moq, err := strconv.ParseFloat(r.FormValue("moq"), 64)
	if err != nil || math.IsNaN(moq) || math.IsInf(moq, 0) {
		return ProductEditRequest{}, errors.New("MOQ must be a number")
	}
	name, origin, grade := r.FormValue("name"), r.FormValue("origin"), r.FormValue("grade")
	condition, description, status := r.FormValue("condition"), r.FormValue("description"), r.FormValue("status")
	if strings.TrimSpace(name) == "" || strings.TrimSpace(origin) == "" || strings.TrimSpace(grade) == "" || strings.TrimSpace(condition) == "" {
		return ProductEditRequest{}, errors.New("Name, origin, grade, and condition are required")
	}
	return ProductEditRequest{Name: &name, Origin: &origin, Grade: &grade, Condition: &condition, AvailableQuantity: &available, MOQ: &moq, Description: &description, Status: &status}, nil
}

func CreateProduct(db *gorm.DB, uploadDir string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var request CreateProductRequest
		var imageFile *multipart.FileHeader
		mediaType, _, _ := mime.ParseMediaType(r.Header.Get("Content-Type"))
		if mediaType == "multipart/form-data" {
			r.Body = http.MaxBytesReader(w, r.Body, maxProductImageSize+(1<<20))
			if err := r.ParseMultipartForm(1 << 20); err != nil {
				if r.MultipartForm != nil {
					_ = r.MultipartForm.RemoveAll()
				}
				var maxBytesErr *http.MaxBytesError
				if errors.As(err, &maxBytesErr) {
					http.Error(w, "Image upload is too large; maximum size is 5 MB", http.StatusRequestEntityTooLarge)
				} else {
					http.Error(w, "Invalid multipart form", http.StatusBadRequest)
				}
				return
			}
			if r.MultipartForm != nil {
				defer r.MultipartForm.RemoveAll()
			}
			var err error
			request, err = createProductRequestFromForm(r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			files := r.MultipartForm.File["image_file"]
			if len(files) > 1 {
				http.Error(w, "Only one image file may be uploaded", http.StatusBadRequest)
				return
			}
			if len(files) == 1 {
				imageFile = files[0]
			}
		} else if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if request.Name == "" {
			http.Error(w, "Product name is required", http.StatusBadRequest)
			return
		}

		if request.AvailableQuantity < 0 {
			http.Error(w, "Available quantity cannot be negative", http.StatusBadRequest)
			return
		}

		if request.MOQ < 0 {
			http.Error(w, "MOQ cannot be negative", http.StatusBadRequest)
			return
		}

		if request.Status != "Available" && request.Status != "Unavailable" {
			http.Error(
				w,
				"Status must be Available or Unavailable",
				http.StatusBadRequest,
			)
			return
		}

		imagePath := request.Image
		storedImagePath := ""
		if imageFile != nil {
			data, extension, err := readProductImage(imageFile)
			if err != nil {
				status := http.StatusBadRequest
				if errors.Is(err, errProductImageTooLarge) {
					status = http.StatusRequestEntityTooLarge
				}
				http.Error(w, err.Error(), status)
				return
			}
			imagePath, storedImagePath, err = saveProductImage(uploadDir, data, extension)
			if err != nil {
				http.Error(w, "Failed to store uploaded image", http.StatusInternalServerError)
				return
			}
		}

		product := models.Product{
			Name:              request.Name,
			Origin:            request.Origin,
			Grade:             request.Grade,
			Condition:         request.Condition,
			AvailableQuantity: request.AvailableQuantity,
			MOQ:               request.MOQ,
			Description:       request.Description,
			Image:             imagePath,
			Status:            request.Status,
		}

		if err := db.Create(&product).Error; err != nil {
			if storedImagePath != "" {
				_ = os.Remove(storedImagePath)
			}
			http.Error(w, "Failed to create product", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)

		json.NewEncoder(w).Encode(product)
	}
}

func createProductRequestFromForm(r *http.Request) (CreateProductRequest, error) {
	availableQuantity, err := strconv.ParseFloat(r.FormValue("available_quantity"), 64)
	if err != nil || math.IsNaN(availableQuantity) || math.IsInf(availableQuantity, 0) {
		return CreateProductRequest{}, errors.New("Available quantity must be a number")
	}
	moq, err := strconv.ParseFloat(r.FormValue("moq"), 64)
	if err != nil || math.IsNaN(moq) || math.IsInf(moq, 0) {
		return CreateProductRequest{}, errors.New("MOQ must be a number")
	}
	return CreateProductRequest{
		Name:              r.FormValue("name"),
		Origin:            r.FormValue("origin"),
		Grade:             r.FormValue("grade"),
		Condition:         r.FormValue("condition"),
		AvailableQuantity: availableQuantity,
		MOQ:               moq,
		Description:       r.FormValue("description"),
		Image:             r.FormValue("image"),
		Status:            r.FormValue("status"),
	}, nil
}

func readProductImage(header *multipart.FileHeader) ([]byte, string, error) {
	if header.Size > maxProductImageSize {
		return nil, "", errProductImageTooLarge
	}
	file, err := header.Open()
	if err != nil {
		return nil, "", errors.New("Unable to read uploaded image")
	}
	defer file.Close()
	data, err := io.ReadAll(io.LimitReader(file, maxProductImageSize+1))
	if err != nil {
		return nil, "", errors.New("Unable to read uploaded image")
	}
	if int64(len(data)) > maxProductImageSize {
		return nil, "", errProductImageTooLarge
	}
	if len(data) == 0 {
		return nil, "", errors.New("Uploaded image is empty")
	}

	filename := strings.ReplaceAll(header.Filename, "\\", "/")
	extension := strings.ToLower(path.Ext(path.Base(filename)))
	contentType := http.DetectContentType(data[:min(len(data), 512)])
	_, format, decodeErr := image.DecodeConfig(bytes.NewReader(data))
	if decodeErr != nil {
		return nil, "", errors.New("Uploaded file is not a valid JPEG or PNG image")
	}
	switch {
	case (extension == ".jpg" || extension == ".jpeg") && contentType == "image/jpeg" && format == "jpeg":
		extension = ".jpg"
	case extension == ".png" && contentType == "image/png" && format == "png":
	default:
		return nil, "", errors.New("Only JPEG and PNG images are supported")
	}
	return data, extension, nil
}

func saveProductImage(uploadDir string, data []byte, extension string) (string, string, error) {
	if extension != ".jpg" && extension != ".png" {
		return "", "", errors.New("Unsupported image extension")
	}
	if err := os.MkdirAll(uploadDir, 0o750); err != nil {
		return "", "", err
	}
	for attempt := 0; attempt < 3; attempt++ {
		var randomName [16]byte
		if _, err := rand.Read(randomName[:]); err != nil {
			return "", "", err
		}
		filename := hex.EncodeToString(randomName[:]) + extension
		filePath := filepath.Join(uploadDir, filename)
		file, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o640)
		if errors.Is(err, os.ErrExist) {
			continue
		}
		if err != nil {
			return "", "", err
		}
		if _, err := file.Write(data); err != nil {
			file.Close()
			_ = os.Remove(filePath)
			return "", "", err
		}
		if err := file.Close(); err != nil {
			_ = os.Remove(filePath)
			return "", "", err
		}
		return productImageURLPrefix + filename, filePath, nil
	}
	return "", "", errors.New("Could not allocate a unique image filename")
}

func ServeProductImage(uploadDir string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		filename := r.PathValue("filename")
		if !uploadedImageNamePattern.MatchString(filename) {
			http.NotFound(w, r)
			return
		}
		root, err := filepath.Abs(uploadDir)
		if err != nil {
			http.Error(w, "Image storage unavailable", http.StatusInternalServerError)
			return
		}
		filePath := filepath.Join(root, filename)
		relative, err := filepath.Rel(root, filePath)
		if err != nil || relative == ".." || strings.HasPrefix(relative, ".."+string(filepath.Separator)) {
			http.NotFound(w, r)
			return
		}
		file, err := os.Open(filePath)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		defer file.Close()
		info, err := file.Stat()
		if err != nil || !info.Mode().IsRegular() {
			http.NotFound(w, r)
			return
		}
		contentType := "image/png"
		if strings.HasSuffix(filename, ".jpg") {
			contentType = "image/jpeg"
		}
		w.Header().Set("Content-Type", contentType)
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		http.ServeContent(w, r, filename, info.ModTime(), file)
	}
}
