export class AnalyticsService {
  constructor(repository) {
    this.repository = repository;
  }

  analyticsSembera(filters) {
    return { success: true, data: this.repository.analyticsSembera(filters) };
  }

  anayticsHryhorovych(filters) {
    return {
      success: true,
      data: this.repository.anayticsHryhorovych(filters),
    };
  }
}
