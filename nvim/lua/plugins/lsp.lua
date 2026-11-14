return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        bashls = {},
        buf_ls = {}, -- protobuf (installs `buf` via mason)
        gopls = {
          settings = {
            gopls = {
              -- lists replace LazyVim's defaults, so repeat them here
              directoryFilters = {
                "-.git",
                "-.vscode",
                "-.idea",
                "-.vscode-test",
                "-node_modules",
                "-_output",
                "-.terraform",
              },
            },
          },
        },
        yamlls = {
          settings = {
            yaml = {
              -- Opt-in Kubernetes schema; use `# yaml-language-server: $schema=...` modelines elsewhere
              schemas = { kubernetes = { "*.k8s.yaml" } },
            },
          },
        },
      },
    },
  },

  -- Upstream Kubernetes repos use plain gofmt: keep goimports, skip gofumpt there.
  {
    "stevearc/conform.nvim",
    opts = {
      formatters_by_ft = {
        go = function(buf)
          if require("user.upstream").is_upstream(buf) then
            return { "goimports" }
          end
          return { "goimports", "gofumpt" }
        end,
      },
    },
  },

  {
    "mfussenegger/nvim-lint",
    opts = {
      linters_by_ft = {
        yaml = { "actionlint" },
      },
      linters = {
        -- only GitHub Actions workflows (no ghaction filetype in nvim 0.12)
        actionlint = {
          condition = function(ctx)
            return ctx.filename:find("/%.github/workflows/") ~= nil
          end,
        },
      },
    },
  },

  { "mason-org/mason.nvim", opts = { ensure_installed = { "actionlint" } } },

  {
    "nvim-treesitter/nvim-treesitter",
    opts = { ensure_installed = { "proto", "make", "fish", "gotmpl", "jsonnet", "jq", "starlark", "sql" } },
  },
}
