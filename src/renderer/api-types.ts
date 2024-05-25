//  --- LoginData ---

export interface LoginData {
  username: string;
  password: string;
  remember?: boolean;
  [k: string]: unknown;
}

//  --- Project ---

export type ACLEntry = {
    role_id: string;
    
    read: boolean;
    write: boolean;
    execute: boolean;
};

export type Acl = ACLEntry[];

export interface Project {
  name: string;
  template_repo_branch: string;
  template_repo_id: string;
  id: string;
  owner_id: string;
  acl: Acl;
}

//  --- ProjectBase ---

export interface ProjectBase {
  name: string;
  template_repo_branch: string;
  template_repo_id: string;
  [k: string]: unknown;
}

//  --- ProjectCreate ---

export interface ProjectCreate {
  name: string;
  template_repo_branch: string;
  template_repo_id: string;
  [k: string]: unknown;
}

//  --- Repo ---

export interface Repo {
  name: string;
  id: string;
  owner_id: string;
  acl: Acl;
}

//  --- RepoBase ---

export interface RepoBase {
  name: string;
  [k: string]: unknown;
}

//  --- RepoCreate ---

export interface RepoCreate {
  name: string;
  [k: string]: unknown;
}

//  --- Role ---

export interface Role {
  name: string;
  id: string;
}

//  --- RoleBase ---

export interface RoleBase {
  name: string;
  [k: string]: unknown;
}

//  --- RoleCreate ---

export interface RoleCreate {
  name: string;
  [k: string]: unknown;
}

//  --- User ---

export type Roles = Role[];
export type TemplateRepos = Repo[];
export type Projects = Project[];

export interface User {
  username: string;
  id: string;
  roles: Roles;
  template_repos: TemplateRepos;
  projects: Projects;
  admin: boolean;
  [k: string]: unknown;
}
export interface Role {
  name: string;
  id: string;
  [k: string]: unknown;
}
export interface Repo {
  name: string;
  id: string;
  owner_id: string;
  acl: Acl;
  [k: string]: unknown;
}
export interface Project {
  name: string;
  template_repo_branch: string;
  template_repo_id: string;
  id: string;
  owner_id: string;
  acl: Acl;
  [k: string]: unknown;
}

//  --- UserBase ---

export interface UserBase {
  username: string;
  [k: string]: unknown;
}

//  --- UserCreate ---

export interface UserCreate {
  username: string;
  password: string;
  [k: string]: unknown;
}
