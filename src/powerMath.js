export function myErf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
  const result = 1 - poly * Math.exp(-x * x)
  return x >= 0 ? result : -result
}
export function myNcdf(z) { return 0.5 * (1 + myErf(z / Math.sqrt(2))) }
export function myNpdf(z) { return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI) }
export function myNppf(prob) {
  if (prob <= 0) return -Infinity
  if (prob >= 1) return Infinity
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239]
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]
  const nppfLow = 0.02425; const nppfHigh = 1 - nppfLow
  if (prob < nppfLow) { const nppfQ1 = Math.sqrt(-2 * Math.log(prob)); return (((((c[0]*nppfQ1+c[1])*nppfQ1+c[2])*nppfQ1+c[3])*nppfQ1+c[4])*nppfQ1+c[5]) / ((((d[0]*nppfQ1+d[1])*nppfQ1+d[2])*nppfQ1+d[3])*nppfQ1+1) }
  else if (prob <= nppfHigh) { const nppfQ2 = prob - 0.5; const nppfR = nppfQ2 * nppfQ2; return (((((a[0]*nppfR+a[1])*nppfR+a[2])*nppfR+a[3])*nppfR+a[4])*nppfR+a[5])*nppfQ2 / (((((b[0]*nppfR+b[1])*nppfR+b[2])*nppfR+b[3])*nppfR+b[4])*nppfR+1) }
  else { const nppfQ3 = Math.sqrt(-2 * Math.log(1 - prob)); return -(((((c[0]*nppfQ3+c[1])*nppfQ3+c[2])*nppfQ3+c[3])*nppfQ3+c[4])*nppfQ3+c[5]) / ((((d[0]*nppfQ3+d[1])*nppfQ3+d[2])*nppfQ3+d[3])*nppfQ3+1) }
}
export function getPower(sampleN, effectDelta, stdDev, alphaLevel) {
  const gpStdErr = stdDev / Math.sqrt(sampleN); const gpCritZ = myNppf(1 - alphaLevel / 2); const gpNcp = effectDelta / gpStdErr
  return 1 - myNcdf(gpCritZ - gpNcp) + myNcdf(-gpCritZ - gpNcp)
}
export function getSampleSize(effectDelta, stdDev, alphaLevel, desiredPower) {
  const gsCritZ = myNppf(1 - alphaLevel / 2); const gsBetaZ = myNppf(desiredPower)
  return Math.ceil(((gsCritZ + gsBetaZ) * stdDev / effectDelta) ** 2)
}
