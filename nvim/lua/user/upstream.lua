-- Detect buffers that live in upstream Kubernetes repos, where we must not
-- introduce formatting churn (gofumpt, shfmt, yamlls, markdownlint --fix, ...).
local M = {}

M.patterns = { "/k8s.io/", "/sigs.k8s.io/", "/github.com/kubernetes/", "/github.com/kubernetes-sigs/" }

---@param buf? integer
---@return boolean
function M.is_upstream(buf)
  local path = vim.api.nvim_buf_get_name(buf or 0)
  for _, p in ipairs(M.patterns) do
    if path:find(p, 1, true) then
      return true
    end
  end
  return false
end

return M
