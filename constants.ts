import { Project } from './types';
import projectsData from './data/projects.json';

// 从 JSON 文件加载项目数据
// 编辑 data/projects.json 文件来修改项目信息
export const PROJECTS: Project[] = projectsData.projects as Project[];
