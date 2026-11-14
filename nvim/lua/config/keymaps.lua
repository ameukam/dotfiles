-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua

local map = vim.keymap.set

-- Kubernetes (read-only on purpose: no apply mapping) -------------------------
local function kube(args, title)
  local file = vim.fn.expand("%:p")
  if file == "" then
    return vim.notify("kubectl: buffer has no file", vim.log.levels.WARN)
  end
  local ctx = vim.trim(vim.fn.system({ "kubectl", "config", "current-context" }))
  local cmd = vim.list_extend({ "kubectl" }, vim.list_extend(vim.deepcopy(args), { "-f", file }))
  vim.system(cmd, { text = true }, function(r)
    vim.schedule(function()
      local out = (r.stdout or "") .. (r.stderr or "")
      Snacks.win({
        text = out ~= "" and out or "(no changes)",
        ft = "diff",
        width = 0.8,
        height = 0.8,
        border = "rounded",
        title = (" %s [%s] "):format(title, ctx),
      })
    end)
  end)
end

map("n", "<leader>kd", function()
  kube({ "diff" }, "kubectl diff")
end, { desc = "kubectl diff file" })
map("n", "<leader>kv", function()
  kube({ "apply", "--dry-run=server" }, "kubectl dry-run")
end, { desc = "kubectl server dry-run" })

-- Base64 (k8s Secrets): never mutate the buffer ------------------------------
local function selection()
  local lines = vim.fn.getregion(vim.fn.getpos("v"), vim.fn.getpos("."), { type = vim.fn.mode() })
  return table.concat(lines, "\n")
end

map("x", "<leader>cD", function()
  local ok, out = pcall(vim.base64.decode, vim.trim(selection()))
  vim.notify(
    ok and out or ("base64: " .. out),
    ok and vim.log.levels.INFO or vim.log.levels.ERROR,
    { title = "Base64 decode" }
  )
end, { desc = "Base64 decode (peek)" })

map("x", "<leader>cE", function()
  vim.fn.setreg("+", vim.base64.encode(vim.trim(selection())))
  vim.notify("base64 copied to clipboard", vim.log.levels.INFO, { title = "Base64 encode" })
end, { desc = "Base64 encode → clipboard" })
