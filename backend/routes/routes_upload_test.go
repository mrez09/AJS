package routes

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/golang-jwt/jwt/v5"
)

func TestConfiguredUploadDirectoryIsServedPublicly(t *testing.T) {
	dir := t.TempDir()
	filename := "0123456789abcdef0123456789abcdef.png"
	if err := os.WriteFile(filepath.Join(dir, filename), []byte("png bytes"), 0o600); err != nil {
		t.Fatal(err)
	}

	request := httptest.NewRequest(http.MethodGet, "/uploads/"+filename, nil)
	response := httptest.NewRecorder()
	Register(nil, dir).ServeHTTP(response, request)

	if response.Code != http.StatusOK {
		t.Fatalf("image GET status = %d, want %d", response.Code, http.StatusOK)
	}
	if got := response.Header().Get("Content-Type"); got != "image/png" {
		t.Fatalf("Content-Type = %q, want image/png", got)
	}
}

func TestBuyerCannotReachAdminProductUpdate(t *testing.T) {
	t.Setenv("JWT_SECRET", "edit-route-test-secret")
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"user_id": 1, "role": "buyer"})
	tokenString, err := token.SignedString([]byte("edit-route-test-secret"))
	if err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest(http.MethodPut, "/api/admin/products/1", bytes.NewBufferString(`{"name":"Forbidden"}`))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer "+tokenString)
	response := httptest.NewRecorder()
	Register(nil, t.TempDir()).ServeHTTP(response, request)
	if response.Code != http.StatusForbidden {
		t.Fatalf("buyer update status = %d, want %d", response.Code, http.StatusForbidden)
	}
}
