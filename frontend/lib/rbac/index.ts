import { policies, type Role, type Rule, type ModulePolicy } from "./policies"
import { predicates } from "./predicates"

export type { Role, Rule, ModulePolicy }

export interface RBACContext {
  user_id?: string
  patient_id?: string
  doctor_id?: string
  staff_id?: string
  rules?: Record<string, any>
}

export class RBACManager {
  private policies = policies
  private predicates = predicates

  hasPermission(
    role: Role,
    module: string,
    action: "create" | "read" | "update" | "delete",
    context?: RBACContext,
    row?: any,
  ): boolean {
    const modulePolicy = this.policies[module]
    if (!modulePolicy) return false

    const rule = modulePolicy[role]
    if (!rule) return false

    const scope = rule[action]
    if (!scope || scope === "none") return false

    // If scope is 'any', allow access
    if (scope === "any") {
      return this.checkPredicates(rule.predicates, row, context)
    }

    // If scope is 'own', check ownership and predicates
    if (scope === "own") {
      const ownsResource = this.checkOwnership(module, row, context)
      return ownsResource && this.checkPredicates(rule.predicates, row, context)
    }

    return false
  }

  private checkOwnership(module: string, row: any, context?: RBACContext): boolean {
    if (!row || !context) return false

    // Define ownership rules for different modules
    const ownershipRules: Record<string, (row: any, ctx: RBACContext) => boolean> = {
      patients: (row, ctx) => row.patient_id === ctx.patient_id,
      appointments: (row, ctx) => row.patient_id === ctx.patient_id || row.doctor_id === ctx.doctor_id,
      "medical-records": (row, ctx) => row.patient_id === ctx.patient_id || row.doctor_id === ctx.doctor_id,
      billing: (row, ctx) => row.patient_id === ctx.patient_id,
      prescriptions: (row, ctx) => row.patient_id === ctx.patient_id || row.doctor_id === ctx.doctor_id,
      "ambulance-log": (row, ctx) => row.driver_id === ctx.staff_id,
    }

    const ownershipCheck = ownershipRules[module]
    return ownershipCheck ? ownershipCheck(row, context) : false
  }

  private checkPredicates(predicateNames?: string[], row?: any, context?: RBACContext): boolean {
    if (!predicateNames || predicateNames.length === 0) return true

    return predicateNames.every((predicateName) => {
      const predicate = this.predicates[predicateName as keyof typeof this.predicates]
      return predicate ? predicate(row, context) : false
    })
  }

  canAccessModule(role: Role, module: string): boolean {
    const modulePolicy = this.policies[module]
    if (!modulePolicy) return false

    const rule = modulePolicy[role]
    if (!rule) return false

    // Check if user has at least read access
    return rule.read !== "none"
  }

  getAccessibleModules(role: Role): string[] {
    return Object.keys(this.policies).filter((module) => this.canAccessModule(role, module))
  }

  getModulePermissions(role: Role, module: string): Rule | null {
    const modulePolicy = this.policies[module]
    return modulePolicy?.[role] || null
  }
}

export const rbacManager = new RBACManager()

// Helper functions for UI components
export function canShowCreateButton(role: Role, module: string, context?: RBACContext): boolean {
  return rbacManager.hasPermission(role, module, "create", context)
}

export function canShowEditButton(role: Role, module: string, context?: RBACContext, row?: any): boolean {
  return rbacManager.hasPermission(role, module, "update", context, row)
}

export function canShowDeleteButton(role: Role, module: string, context?: RBACContext, row?: any): boolean {
  return rbacManager.hasPermission(role, module, "delete", context, row)
}

export function canAccessRoute(role: Role, route: string): boolean {
  const routeModuleMap: Record<string, string> = {
    "/patients": "patients",
    "/doctors": "doctors",
    "/appointments": "appointments",
    "/medical-records": "medical-records",
    "/billing": "billing",
    "/medicine": "medicine",
    "/pharmacy": "pharmacy",
    "/rooms": "rooms",
    "/room-assignments": "room-assignments",
    "/blood-bank": "blood-bank",
    "/ambulances": "ambulances",
    "/ambulance-log": "ambulance-log",
    "/cleaning": "cleaning-service",
    "/staff": "staff",
  }

  const module = routeModuleMap[route]
  return module ? rbacManager.canAccessModule(role, module) : true
}
