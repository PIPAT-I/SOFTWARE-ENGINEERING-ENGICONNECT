package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/config"
	"github.com/sut68/team21/controller"
	"github.com/sut68/team21/services"
)

func PointRoutes(r *gin.RouterGroup) {
	pointService := services.NewPointService(config.DB)
	pointController := controller.NewPointController(pointService)

	points := r.Group("/points")
	{
		points.GET("/total/:userId", pointController.GetTotalPoint)
		points.POST("/checkin/:userId", pointController.DailyCheckin)
		points.GET("/membership/:userId", pointController.GetMembershipLevel)
		points.GET("/records/:userId", pointController.GetPointRecords)
		points.POST("/rewards", pointController.CreateReward)
		points.GET("/rewards", pointController.GetRewards)
		points.PUT("/rewards/:id", pointController.UpdateReward)
		points.GET("/pending_posts", pointController.GetPendingPosts)
		points.GET("/posts_with_points", pointController.GetPostsWithPoints)
		points.PUT("/post_point/:postId", pointController.UpdatePostPoint)
		points.POST("/reward_redeem", pointController.RedeemReward)
		points.GET("/redeemed/:userId", pointController.GetRedeemedRewards)
		points.DELETE("/rewards/:id", pointController.DeleteReward)
		points.POST("/distribute/:postId", pointController.DistributePoints)
		points.GET("/distributed/:postId", pointController.CheckPointsDistributed)
	}
}