export class BaseController {
  static sendSuccess(res, data, statusCode = 200) {
    return res.status(statusCode).json({ success: true, data });
  }

  static sendError(res, message, statusCode = 500) {
    return res.status(statusCode).json({ success: false, message });
  }
}
