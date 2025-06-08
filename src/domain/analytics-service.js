export class AnalyticsService {
  constructor(repository) {
    this.repository = repository;
  }

  analyticsSembera(filters) {
    return this.repository.analyticsSembera(filters);
  }
}
