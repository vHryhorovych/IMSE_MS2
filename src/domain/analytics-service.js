export class AnalyticsService {
  constructor(repository) {
    this.repository = repository;
  }

  async analyticsSembera(filters) {
    return {
      success: true,
      data: await this.repository.analyticsSembera(filters),
    };
  }

  async analyticsHryhorovych(filters) {
    const startDate = new Date(filters.startDate.setDate(1));
    const endDate = new Date(filters.endDate.setDate(1));
    const analytics = await this.repository.analyticsHryhorovych({
      startDate,
      endDate,
    });
    return {
      success: true,
      data: analytics,
    };
  }
}
