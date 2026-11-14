-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
-- Add any additional options here

-- Disable Neovim's built-in remote URL handler; LazyVim does not depend on it.
vim.g.loaded_nvim_net_plugin = true

-- Cap lsp.log (terraform-ls/marksman stderr grew it to 655 MB). Checked at startup only.
local lsp_log = vim.fn.stdpath("state") .. "/lsp.log"
local st = vim.uv.fs_stat(lsp_log)
if st and st.size > 50 * 1024 * 1024 then
  os.remove(lsp_log)
end
