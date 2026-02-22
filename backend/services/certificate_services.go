package services

import (
	"errors"
	"log"
	"time"


	"github.com/sut68/team21/entity"
	"gorm.io/gorm"
)

type CertificateService struct {
	db *gorm.DB
}
 
func NewCertificateService(db *gorm.DB) *CertificateService {
	return &CertificateService{db: db}
}

//
// =========================
// CREATE
// =========================
//
func (s *CertificateService) CreateCertificate(certificate *entity.Certificate) (*entity.Certificate, error) {
    // 1. Validation
    if certificate.TitleTH == "" {
        return nil, errors.New("title_th is required")
    }
    if certificate.TitleEN == "" {
        return nil, errors.New("title_en is required")
    }



    // -------------------------------------------------------------
    // Checks for existing PostID (Upsert Logic)
    // -------------------------------------------------------------
    var existingCert entity.Certificate
    if err := s.db.Where("post_id = ?", certificate.PostID).First(&existingCert).Error; err == nil {
        // Found existing -> Update it
        log.Println("🔄 Certificate for PostID", certificate.PostID, "already exists. Updating...")
        
        existingCert.TitleTH = certificate.TitleTH
        existingCert.TitleEN = certificate.TitleEN
        existingCert.Detail = certificate.Detail
        existingCert.Organizer = certificate.Organizer
        // existingCert.PictureURL = certificate.PictureURL
        existingCert.PictureParticipation = certificate.PictureParticipation
        existingCert.PictureWinner = certificate.PictureWinner
        if err := s.db.Model(&existingCert).Updates(map[string]interface{}{
            "title_th":               certificate.TitleTH,
            "title_en":              certificate.TitleEN,
            "detail":                certificate.Detail,
            "organizer":             certificate.Organizer,
            // "picture_url":           certificate.PictureURL,
            "picture_participation": certificate.PictureParticipation,
            "picture_winner":        certificate.PictureWinner,
			//"date":                  certificate.Date,
            "type":                  certificate.Type,
        }).Error; err != nil {
             return nil, err
        }
        return &existingCert, nil
    }

    if err := s.db.Create(certificate).Error; err != nil {
        return nil, err
    }

    return certificate, nil
}

	



func (s *CertificateService) GetAllCertificate() ([]entity.Certificate, error) {
	var certificates []entity.Certificate

	err := s.db.
		Preload("User").
		Find(&certificates).Error

	if err != nil {
		return nil, err
	}

	return certificates, nil
}

// ดึง Certificate ตาม ID
func (s *CertificateService) GetCertificateByID(id uint) (*entity.Certificate, error) {
	var certificate entity.Certificate

	err := s.db.
		Preload("User").
		First(&certificate, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("certificate not found")
		}
		return nil, err
	}

	return &certificate, nil
}

// ดึง Certificate ตาม PostID
func (s *CertificateService) GetCertificateByPostID(postID uint) (*entity.Certificate, error) {
	var certificate entity.Certificate

	err := s.db.
		Where("post_id = ?", postID).
		First(&certificate).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("certificate not found")
		}
		return nil, err
	}

	return &certificate, nil
}

// ดึง Certificate ของ user (ใช้กับ /post/my)
func (s *CertificateService) GetMyCertificates(userID uint) ([]entity.Certificate, error) {
	var certificates []entity.Certificate

	err := s.db.
		Where("user_id = ?", userID).
		Find(&certificates).Error

	if err != nil {
		return nil, err
	}

	return certificates, nil
}

//
// =========================
// UPDATE
// =========================
//

func (s *CertificateService) UpdateCertificate(id uint, updatedData *entity.Certificate) error {
	var existingCertificate entity.Certificate
	if err := s.db.First(&existingCertificate, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("certificate not found")
		}
		return err
	}

	updatedData.UpdatedAt = time.Now()

	result := s.db.Model(&entity.Certificate{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"title_th":              updatedData.TitleTH,
			"title_en":              updatedData.TitleEN,
			"detail":                updatedData.Detail,
			"organizer":             updatedData.Organizer,
			// "picture_url":           updatedData.PictureURL,
			"picture_participation": updatedData.PictureParticipation,
			"picture_winner":        updatedData.PictureWinner,
			// "date":                  updatedData.Date,
			"type":                  updatedData.Type,
			"updated_at":            updatedData.UpdatedAt,
		})

	if result.Error != nil {
		return result.Error
	}

	return nil
}

//
// =========================
// DELETE
// =========================
//

func (s *CertificateService) DeleteCertificate(id uint) error {
	var existingCertificate entity.Certificate
	if err := s.db.First(&existingCertificate, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("certificate not found")
		}
		return err
	}

	if err := s.db.Delete(&entity.Certificate{}, id).Error; err != nil {
		return err
	}

	return nil
}
