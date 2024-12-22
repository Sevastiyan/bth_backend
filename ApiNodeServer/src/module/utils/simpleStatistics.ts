/**
 * Reduces an array of numbers by a strict time window (e.g. 40 instances = 20 minutes)
 * @param array list of numbers
 * @param method Function method for reduction (e.g. mean, median, mode, etc.)
 * @returns a reduced list
 */
export function reduceSequence(array: number[], rate: number = 16, method: Function = mean) {
    try {
        const afterAveraging: any[] = []
        for (let i = 0; i < array.length - rate; i += rate) {
            const value = method(array.slice(i, i + rate))
            afterAveraging.push(value)
        }
        return afterAveraging
    } catch (error) {
        console.log('Reducing Empty Array: ', error)
        return []
    }
}

// Median for HR / BR
/**
 * Finds the median of an array of numbers.
 * @param array list of numbers
 * @returns the median of the array
 */
export const median = (array: number[]) => {
    array = array ? array : []
    return array.sort((a, b) => a - b)[Math.floor(array.length / 2)]
}

export const nanmax = (array: number[]) => {
    array = array ? array : []
    const filtered = array.filter((x) => x > 0)
    return Math.max(...filtered)
}

export const nanmin = (array: number[]) => {
    array = array ? array : []
    const filtered = array.filter((x) => x > 0)
    return Math.min(...filtered)
}

/**
 * Finds the mean of an array of numbers
 * @param array list of numbers
 * @returns average of the numbers
 */
export const mean = (array: number[]) => {
    // calculate the mean of the array, skipping 0 values
    array = array ? array : []
    const filtered = array.filter((x) => x > 0)
    const x = filtered.reduce((a, b) => a + b, 0) / filtered.length
    return isNaN(x) ? 0 : x
}

/**
 * Calculate the standard deviation of an array of numbers
 * @param array list of numbers
 * @returns standard deviation value
 */
export const std = (array: number[]) => {
    // calculate the variance of the array, skipping 0 values
    array = array ? array : []
    const filtered = array.filter((x) => x > 0)
    const mean = filtered.reduce((a, b) => a + b, 0) / filtered.length
    const variance = filtered.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / filtered.length
    return isNaN(variance) ? 0 : Math.sqrt(variance)
}

export const minimum = (array: number[]) => {
    //filter out less than 0 values
    array = array ? array : []
    const filtered = array.filter((x) => x > 0)
    return isFinite(Math.min(...filtered)) ? 0 : Math.min(...filtered)
}

// Mode for Sleep Staging
/**
 * Function used for Sleep Staging data
 * @param array list of numbers to reduce
 * @returns the mode of the array
 */
export const mode = (array: number[]) => {
    array = array ? array : []
    const modes = array.reduce((a, b) => ((a[b] = (a[b] || 0) + 1), a), {})
    return Object.keys(modes)
        .map(Number)
        .sort((a, b) => modes[b] - modes[a])[0]
}

export function elementDiff(array: number[]) {
    array = array ? array : []
    const filtered = array.filter((x) => x > 0)
    const x = filtered.slice(1).map((v, i) => Math.abs(v - filtered[i]))
    return x
}

export function sum(array: number[]) {
    array = array ? array : []
    const x = array.reduce((a, b) => a + b, 0)
    return isNaN(x) ? 0 : x
}

export function radarAverages(array: number[][]) {
    const result: number[][] = []
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            if (!result[j]) {
                result.push([])
            }
            result[j].push(array[i][j])
        }
    }

    return result.map((element) => mean(element))
}
