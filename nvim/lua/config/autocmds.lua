-- Autocmds are automatically loaded on the VeryLazy event
-- Default autocmds that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/autocmds.lua

local upstream = require("user.upstream")

-- Upstream Kubernetes repos: no format-on-save for non-Go files (Go uses goimports only,
-- see lua/plugins/lsp.lua). Format explicitly with <leader>cf when you really want it.
vim.api.nvim_create_autocmd("FileType", {
  group = vim.api.nvim_create_augroup("user_upstream_fmt", { clear = true }),
  pattern = { "markdown", "yaml", "sh", "bash", "proto", "json" },
  callback = function(ev)
    if upstream.is_upstream(ev.buf) then
      vim.b[ev.buf].autoformat = false
    end
  end,
})

-- Secrets: never write swap or persistent-undo files.
-- Note: yanked text still lands in ShaDa registers.
vim.api.nvim_create_autocmd({ "BufReadPre", "BufNewFile" }, {
  group = vim.api.nvim_create_augroup("user_secrets", { clear = true }),
  pattern = {
    "*.key",
    "*.pem",
    "id[-_]rsa*",
    "*recovery*",
    "*passphrase*",
    "*github_token*",
    "*.env",
    ".env*",
    "*kubeconfig*",
    "*.tfstate*",
    "*.tfvars",
    "/dev/shm/*",
    "/tmp/kubectl-edit-*",
  },
  callback = function()
    vim.opt_local.undofile = false
    vim.opt_local.swapfile = false
  end,
})
