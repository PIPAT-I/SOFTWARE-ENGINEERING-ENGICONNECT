package config

import (
	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost) // สร้าง hash จากรหัสผ่าน
	return string(hash), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) // เปรียบเทียบรหัสผ่านกับ ค่า password ที่ hash ของ user
	return err == nil
}
