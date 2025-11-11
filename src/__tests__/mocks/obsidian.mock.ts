import { vi } from 'vitest';

export const TFile = vi.fn();
export const TFolder = vi.fn();
export const Vault = vi.fn();
export const App = vi.fn();
export const Plugin = vi.fn();
export const PluginSettingTab = vi.fn();
export const Setting = vi.fn();
export const Notice = vi.fn();
export const Modal = vi.fn();
export const Menu = vi.fn();
export const ViewStateResult = vi.fn();
export const FileView = vi.fn();
export const ItemView = vi.fn();
export const MarkdownView = vi.fn();
export const requestUrl = vi.fn();
export const parseYaml = vi.fn();
export const stringifyYaml = vi.fn();

export default {
  TFile,
  TFolder,
  Vault,
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  Notice,
  Modal,
  Menu,
  ViewStateResult,
  FileView,
  ItemView,
  MarkdownView,
  requestUrl,
  parseYaml,
  stringifyYaml,
};
