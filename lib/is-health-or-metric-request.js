export default function isHealthOrMetricRequest(req) {
  return req.path.startsWith("/_") || req.path.startsWith("/metrics");
}
