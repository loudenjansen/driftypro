let onChange = () => {}
let current = 'login'

export function initRouter(cb){ onChange = cb }
export function navigate(route){ current = route; onChange(route) }
export function getRoute(){ return current }
