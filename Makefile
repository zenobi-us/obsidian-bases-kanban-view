.PHONY: help build dev clean watch type-check

help:
	@echo "Obsidian Kanban Plugin - Developer Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev            Watch, rebuild, and auto-install on changes"
	@echo "  make watch          Same as 'make dev'"
	@echo ""
	@echo "Build:"
	@echo "  make build          Build the plugin once (TypeScript + esbuild)"
	@echo "  make type-check     Run TypeScript type checking only"
	@echo "  make clean          Remove dist/ directory"
	@echo ""

dev:
	bash tools/dev.sh

watch: dev

build:
	npm run build

type-check:
	tsc -noEmit

clean:
	rm -rf dist/

.DEFAULT_GOAL := help
