export const uid = () => 'id' + Math.random().toString(36).slice(2,9)
export const nowISO = () => new Date().toISOString()
export const hoursBetween = (s,e) => Math.max(1, Math.round((new Date(e) - new Date(s))/3600000))
export const toISODateHour = (dateStr,h) => { const d = new Date(dateStr); d.setHours(h,0,0,0); return d.toISOString() }
export const timesOverlap = (aStart,aEnd,bStart,bEnd) => !(new Date(aEnd)<=new Date(bStart) || new Date(aStart)>=new Date(bEnd))
