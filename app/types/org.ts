export type Scope = 'rw' | 'rt'
export type Mode = 'add' | 'edit'

export interface OrgNode {
  id: string
  title: string
  name: string
  address: string
  children?: OrgNode[]
}
