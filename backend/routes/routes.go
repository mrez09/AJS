package routes

import (
	"net/http"

	"github.com/mrez09/AJS/handlers"
	"github.com/mrez09/AJS/middleware"
	"gorm.io/gorm"
)

func Register(db *gorm.DB, uploadDir string) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /uploads/{filename}", handlers.ServeProductImage(uploadDir))
	mux.HandleFunc("/api/health", handlers.Health)
	mux.HandleFunc("/api/products", handlers.GetProducts(db))
	mux.HandleFunc("GET /api/products/{id}", handlers.GetProduct(db))
	mux.HandleFunc("POST /api/login", handlers.Login(db))
	mux.Handle(
		"GET /api/me",
		middleware.RequireAuth(
			http.HandlerFunc(handlers.Me),
		),
	)

	mux.Handle(
		"POST /api/orders",
		middleware.RequireAuth(
			middleware.RequireRole("buyer")(
				http.HandlerFunc(handlers.CreateOrder(db)),
			),
		),
	)

	mux.Handle(
		"GET /api/orders",
		middleware.RequireAuth(
			middleware.RequireRole("buyer")(
				http.HandlerFunc(handlers.GetOrders(db)),
			),
		),
	)

	/**Admin*/
	mux.Handle(
		"GET /api/admin/orders",
		middleware.RequireAuth(
			middleware.RequireRole("admin")(
				http.HandlerFunc(handlers.GetAllOrders(db)),
			),
		),
	)

	mux.Handle(
		"PUT /api/admin/orders/{id}/status",
		middleware.RequireAuth(
			middleware.RequireRole("admin")(
				http.HandlerFunc(handlers.UpdateOrderStatus(db)),
			),
		),
	)

	mux.Handle(
		"PUT /api/admin/products/{id}",
		middleware.RequireAuth(
			middleware.RequireRole("admin")(
				http.HandlerFunc(handlers.UpdateProduct(db, uploadDir)),
			),
		),
	)

	mux.Handle(
		"POST /api/admin/products",
		middleware.RequireAuth(
			middleware.RequireRole("admin")(
				http.HandlerFunc(handlers.CreateProduct(db, uploadDir)),
			),
		),
	)

	//Cart
	mux.Handle(
		"GET /api/cart",
		middleware.RequireAuth(
			middleware.RequireRole("buyer")(
				http.HandlerFunc(handlers.GetCart(db)),
			),
		),
	)

	mux.Handle(
		"POST /api/cart/items",
		middleware.RequireAuth(
			middleware.RequireRole("buyer")(
				http.HandlerFunc(handlers.AddCartItem(db)),
			),
		),
	)

	mux.Handle(
		"DELETE /api/cart/items/{id}",
		middleware.RequireAuth(
			middleware.RequireRole("buyer")(
				http.HandlerFunc(handlers.RemoveCartItem(db)),
			),
		),
	)

	return mux
}
