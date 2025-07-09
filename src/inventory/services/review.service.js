import http from "../../shared/services/http-common.js";

export class ReviewService {
    reviewsEndpoint = "/api/v1/review";

    getReviewsForLoteId(loteId) {
        return http.get(`${this.reviewsEndpoint}?loteId=${loteId}`);
    }

    createReview(loteId, review) {
        return http.post(this.reviewsEndpoint, { ...review, loteId });
    }
}