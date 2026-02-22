package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/services"
)

type MetadataController struct {
	metadataService *services.MetadataService
}

func NewMetadataController(metadataService *services.MetadataService) *MetadataController {
	return &MetadataController{metadataService: metadataService}
}

func (c *MetadataController) GetFaculties(ctx *gin.Context) {
	faculties, err := c.metadataService.GetAllFaculties()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถดึงข้อมูลคณะได้",
		})
		return
	}

	ctx.JSON(http.StatusOK, faculties)
}

func (c *MetadataController) GetMajors(ctx *gin.Context) {
	majors, err := c.metadataService.GetAllMajors()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถดึงข้อมูลสาขาได้",
		})
		return
	}

	ctx.JSON(http.StatusOK, majors)
}

func (c *MetadataController) GetLocations(ctx *gin.Context) {
	locations, err := c.metadataService.GetAllLocations()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถดึงข้อมูลสถานที่ได้",
		})
		return
	}

	ctx.JSON(http.StatusOK, locations)
}
