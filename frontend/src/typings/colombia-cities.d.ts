declare module 'colombia-cities' {
  export interface ColombiaDepartment {
    id: number;
    nombre: string;
    totalMunicipios: number;
  }

  export interface ColombiaCity {
    codigo: string;
    nombre: string;
    departamento: string;
  }

  export function getDepartments(): ColombiaDepartment[];
  export function getCitiesByDepartment(departmentName: string): ColombiaCity[];
}
