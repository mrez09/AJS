package main

import (
	"log"
	"net/http"

	"github.com/mrez09/AJS/config"
	"github.com/mrez09/AJS/models"
	"github.com/mrez09/AJS/routes"
	seeders "github.com/mrez09/AJS/seeders"
)


func main() {
	db, err := config.ConnectDatabase()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Database connected successfully")

	err = db.AutoMigrate(
		&models.Product{},
		&models.User{},
		&models.Order{},
		&models.OrderItem{},
	)

	if err != nil {
		log.Fatal(err)
	}

	log.Println("Product table migrated successfully")

	err = seeders.SeedProducts(db)
	if err != nil {
		log.Fatal(err)
	}

	err = seeders.SeedUsers(db)
		if err != nil {
			log.Fatal(err)
		}

		log.Println("Users seeded successfully")

	log.Println("Products seeded successfully")

	router := routes.Register(db)

	log.Println("AJS API running on http://localhost:8080")

	err = http.ListenAndServe(":8080", router)
	if err != nil {
		log.Fatal(err)
	}
}