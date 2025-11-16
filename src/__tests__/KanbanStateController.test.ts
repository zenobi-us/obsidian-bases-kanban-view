import { describe, it, expect, beforeEach, vi } from "vitest";
import { KanbanStateController } from "../utils/KanbanStateController";
import { App, QueryController, BasesViewConfig, TFile } from "obsidian";

describe("KanbanStateController", () => {
  let controller: KanbanStateController;
  let mockQueryController: QueryController;
  let mockApp: App;
  let mockFileManager: any;
  let mockVault: any;

  beforeEach(() => {
    // Mock file manager
    mockFileManager = {
      processFrontMatter: vi.fn().mockResolvedValue(undefined),
    };

    // Mock vault
    mockVault = {
      getFileByPath: vi.fn(),
    };

    // Mock app
    mockApp = {
      fileManager: mockFileManager,
      vault: mockVault,
    } as any;

    // Mock QueryController
    mockQueryController = {} as any;

    controller = new KanbanStateController(mockQueryController, mockApp);
  });

  describe("moveCard", () => {
    it("should throw error if cardId is missing", async () => {
      await expect(controller.moveCard("", "target")).rejects.toThrow(
        "cardId and targetGroupId are required"
      );
    });

    it("should throw error if targetGroupId is missing", async () => {
      await expect(controller.moveCard("file.md", "")).rejects.toThrow(
        "cardId and targetGroupId are required"
      );
    });

    it("should throw error if grouping property not yet determined", async () => {
      await expect(
        controller.moveCard("file.md", "Done")
      ).rejects.toThrow("Grouping property not yet determined");
    });

    it("should throw error if file not found", async () => {
      // Manually set grouping property to bypass the "not determined" check
      (controller as any).groupByPropertyId = "note.status";

      mockVault.getFileByPath.mockReturnValue(null);

      await expect(
        controller.moveCard("missing.md", "Done")
      ).rejects.toThrow("File not found for cardId: missing.md");
    });

    it("should update file frontmatter when moving card", async () => {
      // Manually set grouping property
      (controller as any).groupByPropertyId = "note.status";

      const mockFile = {} as TFile;
      mockVault.getFileByPath.mockReturnValue(mockFile);

      await controller.moveCard("file.md", "Done");

      expect(mockFileManager.processFrontMatter).toHaveBeenCalledWith(
        mockFile,
        expect.any(Function)
      );
    });

    it("should extract property name correctly from BasesPropertyId", async () => {
      // Manually set grouping property
      (controller as any).groupByPropertyId = "note.status";

      const mockFile = {} as TFile;
      mockVault.getFileByPath.mockReturnValue(mockFile);
      let capturedFrontmatterUpdater: any;

      mockFileManager.processFrontMatter.mockImplementation(
        (file: any, updater: any) => {
          capturedFrontmatterUpdater = updater;
          return Promise.resolve();
        }
      );

      await controller.moveCard("file.md", "In Progress");

      // Call the frontmatter updater
      const mockFrontmatter = {};
      capturedFrontmatterUpdater(mockFrontmatter);

      expect(mockFrontmatter).toEqual({ status: "In Progress" });
    });

    it("should handle complex property IDs", async () => {
      // Manually set grouping property
      (controller as any).groupByPropertyId = "file.some.nested.property" as any;

      const mockFile = {} as TFile;
      mockVault.getFileByPath.mockReturnValue(mockFile);
      let capturedFrontmatterUpdater: any;

      mockFileManager.processFrontMatter.mockImplementation(
        (file: any, updater: any) => {
          capturedFrontmatterUpdater = updater;
          return Promise.resolve();
        }
      );

      await controller.moveCard("file.md", "NewValue");

      // Call the frontmatter updater
      const mockFrontmatter = {};
      capturedFrontmatterUpdater(mockFrontmatter);

      expect(mockFrontmatter).toEqual({ property: "NewValue" });
    });
  });
});
