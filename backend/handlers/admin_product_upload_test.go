package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"testing"

	"github.com/golang-jwt/jwt/v5"
	"github.com/mrez09/AJS/middleware"
	"github.com/mrez09/AJS/models"
	"gorm.io/gorm"
)

func tinyPNG(t *testing.T) []byte {
	t.Helper()
	var data bytes.Buffer
	img := image.NewRGBA(image.Rect(0, 0, 2, 2))
	img.Set(0, 0, color.RGBA{R: 12, G: 80, B: 140, A: 255})
	if err := png.Encode(&data, img); err != nil {
		t.Fatal(err)
	}
	return data.Bytes()
}

func productMultipartRequest(t *testing.T, filename string, fileContents []byte) *http.Request {
	t.Helper()
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	fields := map[string]string{
		"name": "Test commodity", "origin": "Muara Baru", "grade": "A",
		"condition": "Frozen", "available_quantity": "100", "moq": "10",
		"description": "Test", "image": "", "status": "Available",
	}
	for name, value := range fields {
		if err := writer.WriteField(name, value); err != nil {
			t.Fatal(err)
		}
	}
	if filename != "" {
		part, err := writer.CreateFormFile("image_file", filename)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := part.Write(fileContents); err != nil {
			t.Fatal(err)
		}
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest(http.MethodPost, "/api/admin/products", &body)
	request.Header.Set("Content-Type", writer.FormDataContentType())
	return request
}

func TestCreateProductRejectsUnsupportedUpload(t *testing.T) {
	uploadDir := t.TempDir()
	request := productMultipartRequest(t, "payload.txt", []byte("not an image"))
	response := httptest.NewRecorder()
	CreateProduct(nil, uploadDir).ServeHTTP(response, request)
	if response.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want %d; body = %s", response.Code, http.StatusBadRequest, response.Body.String())
	}
	entries, err := os.ReadDir(uploadDir)
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) != 0 {
		t.Fatalf("invalid upload created %d files", len(entries))
	}
}

func TestCreateProductRejectsOversizedUpload(t *testing.T) {
	uploadDir := t.TempDir()
	request := productMultipartRequest(t, "large.png", bytes.Repeat([]byte{0}, int(maxProductImageSize+1)))
	response := httptest.NewRecorder()
	CreateProduct(nil, uploadDir).ServeHTTP(response, request)
	if response.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("status = %d, want %d; body = %s", response.Code, http.StatusRequestEntityTooLarge, response.Body.String())
	}
}

func TestOnlyAdminCanReachCreateProductUpload(t *testing.T) {
	t.Setenv("JWT_SECRET", "upload-test-secret")
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": 1,
		"role":    "buyer",
	})
	tokenString, err := token.SignedString([]byte("upload-test-secret"))
	if err != nil {
		t.Fatal(err)
	}
	handler := middleware.RequireAuth(middleware.RequireRole("admin")(CreateProduct(nil, t.TempDir())))
	request := productMultipartRequest(t, "valid.png", tinyPNG(t))
	request.Header.Set("Authorization", "Bearer "+tokenString)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusForbidden {
		t.Fatalf("non-admin upload status = %d, want %d", response.Code, http.StatusForbidden)
	}
}

func TestSavedImageIsServedByPublicURL(t *testing.T) {
	dir := t.TempDir()
	url, _, err := saveProductImage(dir, tinyPNG(t), ".png")
	if err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest(http.MethodGet, url, nil)
	request.SetPathValue("filename", filepath.Base(url))
	response := httptest.NewRecorder()
	ServeProductImage(dir).ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("GET image status = %d, want %d", response.Code, http.StatusOK)
	}
	if got := response.Header().Get("Content-Type"); got != "image/png" {
		t.Fatalf("Content-Type = %q, want image/png", got)
	}
	if got := response.Header().Get("X-Content-Type-Options"); got != "nosniff" {
		t.Fatalf("X-Content-Type-Options = %q, want nosniff", got)
	}
	if response.Body.Len() == 0 {
		t.Fatal("served image body is empty")
	}

	traversal := httptest.NewRequest(http.MethodGet, "/uploads/../secret.png", nil)
	traversal.SetPathValue("filename", "../secret.png")
	traversalResponse := httptest.NewRecorder()
	ServeProductImage(dir).ServeHTTP(traversalResponse, traversal)
	if traversalResponse.Code != http.StatusNotFound {
		t.Fatalf("path traversal status = %d, want %d", traversalResponse.Code, http.StatusNotFound)
	}
}

func TestCreateProductUploadPersistsURLAndCleansUpOnDBFailure(t *testing.T) {
	db := openOrderTestDB(t)
	uploadDir := t.TempDir()

	request := productMultipartRequest(t, "fresh.png", tinyPNG(t))
	response := httptest.NewRecorder()
	CreateProduct(db, uploadDir).ServeHTTP(response, request)
	if response.Code != http.StatusCreated {
		t.Fatalf("valid upload status = %d; body = %s", response.Code, response.Body.String())
	}
	var created models.Product
	if err := json.Unmarshal(response.Body.Bytes(), &created); err != nil {
		t.Fatal(err)
	}
	if !uploadedImageNamePattern.MatchString(filepath.Base(created.Image)) || filepath.ToSlash(filepath.Dir(created.Image)) != "/uploads" {
		t.Fatalf("unexpected stored image URL: %q", created.Image)
	}
	var persisted models.Product
	if err := db.First(&persisted, created.ID).Error; err != nil {
		t.Fatal(err)
	}
	if persisted.Image != created.Image {
		t.Fatalf("database image URL = %q, response URL = %q", persisted.Image, created.Image)
	}
	if _, err := os.Stat(filepath.Join(uploadDir, filepath.Base(created.Image))); err != nil {
		t.Fatalf("uploaded file was not stored: %v", err)
	}

	// Force the next insert to fail after the file has been written.
	statement := &gorm.Statement{DB: db}
	if err := statement.Parse(&models.Product{}); err != nil {
		t.Fatal(err)
	}
	tableName := statement.Table
	constraint := "upload_cleanup_test_check"
	if err := db.Exec(fmt.Sprintf(`ALTER TABLE "%s" ADD CONSTRAINT "%s" CHECK (name <> 'Database Failure')`, tableName, constraint)).Error; err != nil {
		t.Fatalf("install test constraint: %v", err)
	}
	var failedMultipart bytes.Buffer
	writer := multipart.NewWriter(&failedMultipart)
	for name, value := range map[string]string{
		"name": "Database Failure", "origin": "Muara Baru", "grade": "A",
		"condition": "Frozen", "available_quantity": "100", "moq": "10",
		"description": "Test", "image": "", "status": "Available",
	} {
		if err := writer.WriteField(name, value); err != nil {
			t.Fatal(err)
		}
	}
	part, err := writer.CreateFormFile("image_file", "failed.png")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := part.Write(tinyPNG(t)); err != nil {
		t.Fatal(err)
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	failedRequest := httptest.NewRequest(http.MethodPost, "/api/admin/products", &failedMultipart)
	failedRequest.Header.Set("Content-Type", writer.FormDataContentType())
	failedResponse := httptest.NewRecorder()
	CreateProduct(db, uploadDir).ServeHTTP(failedResponse, failedRequest)
	if failedResponse.Code != http.StatusInternalServerError {
		t.Fatalf("failed product insert status = %d, want %d", failedResponse.Code, http.StatusInternalServerError)
	}
	entries, err := os.ReadDir(uploadDir)
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) != 1 || entries[0].Name() != filepath.Base(created.Image) {
		t.Fatalf("failed insert did not clean only its own file; files = %#v", entries)
	}
	var failedProductCount int64
	if err := db.Model(&models.Product{}).Where("name = ?", "Database Failure").Count(&failedProductCount).Error; err != nil {
		t.Fatal(err)
	}
	if failedProductCount != 0 {
		t.Fatalf("failed product insert persisted %d product rows", failedProductCount)
	}
}

func TestCreateProductContinuesToAcceptLegacyImagePaths(t *testing.T) {
	db := openOrderTestDB(t)
	request := httptest.NewRequest(http.MethodPost, "/api/admin/products", bytes.NewBufferString(`{"name":"Legacy image","available_quantity":10,"moq":1,"image":"/images/legacy.jpg","status":"Available"}`))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	CreateProduct(db, t.TempDir()).ServeHTTP(response, request)
	if response.Code != http.StatusCreated {
		t.Fatalf("legacy JSON product status = %d; body = %s", response.Code, response.Body.String())
	}
	var product models.Product
	if err := json.Unmarshal(response.Body.Bytes(), &product); err != nil {
		t.Fatal(err)
	}
	if product.Image != "/images/legacy.jpg" {
		t.Fatalf("legacy image path changed to %q", product.Image)
	}
}

func TestUpdateProductPreservesImageWithoutReplacementAndKeepsLegacyPartialUpdate(t *testing.T) {
	db := openOrderTestDB(t)
	product := models.Product{Name: "Before", Origin: "North", Grade: "A", Condition: "Frozen", AvailableQuantity: 80, MOQ: 10, Image: "/images/legacy.jpg", Status: "Available"}
	if err := db.Create(&product).Error; err != nil {
		t.Fatal(err)
	}

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	for name, value := range map[string]string{"name": "After", "origin": "South", "grade": "B", "condition": "Chilled", "available_quantity": "70", "moq": "12", "description": "Updated", "status": "Unavailable"} {
		if err := writer.WriteField(name, value); err != nil {
			t.Fatal(err)
		}
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest(http.MethodPut, "/api/admin/products/"+strconv.Itoa(int(product.ID)), &body)
	request.Header.Set("Content-Type", writer.FormDataContentType())
	request.SetPathValue("id", strconv.Itoa(int(product.ID)))
	response := httptest.NewRecorder()
	UpdateProduct(db, t.TempDir()).ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("full update status = %d; body=%s", response.Code, response.Body.String())
	}
	var updated models.Product
	if err := json.Unmarshal(response.Body.Bytes(), &updated); err != nil {
		t.Fatal(err)
	}
	if updated.Name != "After" || updated.Description != "Updated" || updated.Image != "/images/legacy.jpg" {
		t.Fatalf("unexpected update response: %#v", updated)
	}

	legacy := httptest.NewRequest(http.MethodPut, "/api/admin/products/"+strconv.Itoa(int(product.ID)), bytes.NewBufferString(`{"available_quantity":60,"status":"Available"}`))
	legacy.Header.Set("Content-Type", "application/json")
	legacy.SetPathValue("id", strconv.Itoa(int(product.ID)))
	legacyResponse := httptest.NewRecorder()
	UpdateProduct(db).ServeHTTP(legacyResponse, legacy)
	if legacyResponse.Code != http.StatusOK {
		t.Fatalf("legacy update status = %d; body=%s", legacyResponse.Code, legacyResponse.Body.String())
	}
	if err := db.First(&updated, product.ID).Error; err != nil {
		t.Fatal(err)
	}
	if updated.AvailableQuantity != 60 || updated.Name != "After" || updated.Image != "/images/legacy.jpg" {
		t.Fatalf("legacy update changed unrelated data: %#v", updated)
	}
}

func TestUpdateProductReplacesImageAndRejectsInvalidUploadWithoutChangingProduct(t *testing.T) {
	db := openOrderTestDB(t)
	product := models.Product{Name: "Original", AvailableQuantity: 20, MOQ: 2, Image: "/images/original.jpg", Status: "Available"}
	if err := db.Create(&product).Error; err != nil {
		t.Fatal(err)
	}
	uploadDir := t.TempDir()
	request := productMultipartRequest(t, "replacement.png", tinyPNG(t))
	request.Method = http.MethodPut
	request.URL.Path = "/api/admin/products/" + strconv.Itoa(int(product.ID))
	request.SetPathValue("id", strconv.Itoa(int(product.ID)))
	response := httptest.NewRecorder()
	UpdateProduct(db, uploadDir).ServeHTTP(response, request)
	if response.Code != http.StatusOK {
		t.Fatalf("image replacement status = %d; body=%s", response.Code, response.Body.String())
	}
	if err := db.First(&product, product.ID).Error; err != nil {
		t.Fatal(err)
	}
	if product.Image == "/images/original.jpg" || !uploadedImageNamePattern.MatchString(filepath.Base(product.Image)) {
		t.Fatalf("image was not replaced with managed upload URL: %q", product.Image)
	}
	if _, err := os.Stat(filepath.Join(uploadDir, filepath.Base(product.Image))); err != nil {
		t.Fatalf("replacement image missing: %v", err)
	}

	bad := productMultipartRequest(t, "replacement.txt", []byte("not an image"))
	bad.Method = http.MethodPut
	bad.URL.Path = "/api/admin/products/" + strconv.Itoa(int(product.ID))
	bad.SetPathValue("id", strconv.Itoa(int(product.ID)))
	badResponse := httptest.NewRecorder()
	UpdateProduct(db, uploadDir).ServeHTTP(badResponse, bad)
	if badResponse.Code != http.StatusBadRequest {
		t.Fatalf("invalid image status = %d, want 400", badResponse.Code)
	}
	var afterFailure models.Product
	if err := db.First(&afterFailure, product.ID).Error; err != nil {
		t.Fatal(err)
	}
	if afterFailure.Image != product.Image {
		t.Fatalf("invalid upload changed persisted image: %q != %q", afterFailure.Image, product.Image)
	}

	statement := &gorm.Statement{DB: db}
	if err := statement.Parse(&models.Product{}); err != nil {
		t.Fatal(err)
	}
	constraint := "edit_upload_failure_check"
	if err := db.Exec(fmt.Sprintf(`ALTER TABLE "%s" ADD CONSTRAINT "%s" CHECK (name <> 'Test commodity')`, statement.Table, constraint)).Error; err != nil {
		t.Fatalf("install update constraint: %v", err)
	}
	failedSave := productMultipartRequest(t, "db-failure.png", tinyPNG(t))
	failedSave.Method = http.MethodPut
	failedSave.URL.Path = "/api/admin/products/" + strconv.Itoa(int(product.ID))
	failedSave.SetPathValue("id", strconv.Itoa(int(product.ID)))
	failedSaveResponse := httptest.NewRecorder()
	UpdateProduct(db, uploadDir).ServeHTTP(failedSaveResponse, failedSave)
	if failedSaveResponse.Code != http.StatusInternalServerError {
		t.Fatalf("database failure status = %d, want 500", failedSaveResponse.Code)
	}
	if err := db.First(&afterFailure, product.ID).Error; err != nil {
		t.Fatal(err)
	}
	if afterFailure.Image != product.Image {
		t.Fatalf("failed product save changed old image: %q != %q", afterFailure.Image, product.Image)
	}
	files, err := os.ReadDir(uploadDir)
	if err != nil {
		t.Fatal(err)
	}
	if len(files) != 1 || files[0].Name() != filepath.Base(product.Image) {
		t.Fatalf("failed update did not clean only its new upload: %#v", files)
	}
}
