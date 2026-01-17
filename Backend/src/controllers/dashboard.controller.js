import dashboardService from "../services/dashboard.service.js";

class DashboardController {
  async stats(req, res) {
    const stats = await dashboardService.getStats(req.user);
    return res.json(stats);
  }
}

export default new DashboardController();