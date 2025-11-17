import { describe, it, expect, beforeEach, vi } from "vitest";
import { KanbanStateController } from "../utils/KanbanStateController";
import { App, TFile } from "obsidian";

describe("KanbanStateController", () => {
  let controller: KanbanStateController;
  let mockApp: App;
  let mockFileManager: any;
  let mockVault: any;
  let mockConfig: any;

  beforeEach(() => {
    // Mock file manager
    mockFileManager = {
      processFrontMatter: vi.fn().mockResolvedValue(undefined),
    };

    // Mock vault
    mockVault = {
      getFileByPath: vi.fn(),
    };

    // Mock config that implements BasesViewConfig interface
    mockConfig = {
      get: vi.fn((key: string) => {
        const configMap: Record<string, string> = {
          "kanban-columnProperty": "note.status",
          "kanban-columnNames": "To Do,In Progress,Done",
        };
        return configMap[key] || null;
      }),
    } as any;

    // Mock app
    mockApp = {
      fileManager: mockFileManager,
      vault: mockVault,
    } as any;

    controller = new KanbanStateController(mockApp);
  });

  describe("moveCard", () => {
    it("should throw error if cardId is missing", async () => {
      controller.update({
        groupedData: [],
        properties: [],
        config: mockConfig,
        data: [],
      } as any);

      await expect(controller.moveCard("", "target")).rejects.toThrow(
        "entryPath and targetGroupId are required"
      );
    });

    it("should throw error if targetGroupId is missing", async () => {
      controller.update({
        groupedData: [],
        properties: [],
        config: mockConfig,
        data: [],
      } as any);

      await expect(controller.moveCard("file.md", "")).rejects.toThrow(
        "entryPath and targetGroupId are required"
      );
    });

    it("should throw error if config not initialized", async () => {
      await expect(
        controller.moveCard("file.md", "Done")
      ).rejects.toThrow("Kanban config not initialized");
    });

    it("should throw error if file not found", async () => {
      controller.update({
        groupedData: [],
        properties: [],
        config: mockConfig,
        data: [],
      } as any);

      mockVault.getFileByPath.mockReturnValue(null);

      await expect(
        controller.moveCard("missing.md", "Done")
      ).rejects.toThrow("File not found for entryPath: missing.md");
    });

    it("should call processFrontMatter when moving card", async () => {
      controller.update({
        groupedData: [],
        properties: [],
        config: mockConfig,
        data: [],
      } as any);

      const mockFile = {} as TFile;
      mockVault.getFileByPath.mockReturnValue(mockFile);

      await controller.moveCard("file.md", "Done");

      expect(mockFileManager.processFrontMatter).toHaveBeenCalledWith(
        mockFile,
        expect.any(Function)
      );
    });

    it("should extract property name from BasesPropertyId", async () => {
      controller.update({
        groupedData: [],
        properties: [],
        config: mockConfig,
        data: [],
      } as any);

      const mockFile = {} as TFile;
      mockVault.getFileByPath.mockReturnValue(mockFile);

      await controller.moveCard("file.md", "In Progress");

      expect(mockFileManager.processFrontMatter).toHaveBeenCalledWith(
        mockFile,
        expect.any(Function)
      );
    });

    it("should handle complex property IDs", async () => {
      mockConfig.get = vi.fn((key: string) => {
        const configMap: Record<string, string> = {
          "kanban-columnProperty": "file.some.nested.property",
          "kanban-columnNames": "To Do,In Progress,Done",
        };
        return configMap[key] || null;
      });

      controller.update({
        groupedData: [],
        properties: [],
        config: mockConfig,
        data: [],
      } as any);

      const mockFile = {} as TFile;
      mockVault.getFileByPath.mockReturnValue(mockFile);

      await controller.moveCard("file.md", "NewValue");

      expect(mockFileManager.processFrontMatter).toHaveBeenCalledWith(
        mockFile,
        expect.any(Function)
      );
    });
  });
});
