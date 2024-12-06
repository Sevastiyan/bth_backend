import * as AwsCrudFunctions from './AwsCrudFunctions'

/**
 * A class to create a custom table in AWS DynamoDB
 */

export class TableTemplate {
    tableName: string
    mainIndex: { pKey: string; sKey: string }
    defineDataParam: AwsCrudFunctions.DefineDataParam

    /**
     * @param tableName name of the table to create
     * @param mainIndex { pKey: string, sKey: string } primary and secondary index of the table
     * @param typeDefinition { typeDefinition(data: any) } function to define the data type of the table
     */
    constructor(
        tableName: string,
        mainIndex: { pKey: string; sKey: string },
        typeDefinition: AwsCrudFunctions.DefineDataParam,
    ) {
        this.tableName = tableName
        this.mainIndex = mainIndex
        this.defineDataParam = typeDefinition
    }

    /**
     * Creates a new item in the Yearly table.
     * @param item data to be inserted
     * @returns Promise which resolves to the newly created item
     */
    createData(item: any) {
        console.log('createData item: ', item)
        return AwsCrudFunctions.createData({
            TableName: this.tableName,
            Item: item,
            defineDataParam: this.defineDataParam,
        })
    }

    /**
     * Update the current object data in the table
     * @param pValue userId
     * @param sValue created
     * @param item data
     * @returns Promise which resolves to the updated item
     */
    updateData(pValue: string, sValue: string, item: any) {
        return AwsCrudFunctions.updateData({
            TableName: this.tableName,
            indexData: this.mainIndex,
            defineDataParam: this.defineDataParam,
            pValue,
            sValue,
            Item: item,
        })
    }

    /**
     *
     * @param pValue userId
     * @param sValue created
     * @param atts array of attributes to return
     * @returns
     */
    readData(pValue: string, sValue: string, atts?: string[]) {
        return AwsCrudFunctions.readData({
            TableName: this.tableName,
            indexData: this.mainIndex,
            pValue,
            sValue,
            defineDataParam: this.defineDataParam,
            atts,
        })
    }

    /**
     * Delete specific object from Database
     * @param pValue userId
     * @param sValue created
     * @returns
     */
    deleteData(pValue: string, sValue: string) {
        return AwsCrudFunctions.deleteData({
            TableName: this.tableName,
            indexData: this.mainIndex,
            pValue,
            sValue,
        })
    }

    /**
     *
     * @param pValue userId
     * @param sTimestamp start of the time range
     * @param eTimestamp end of the time range
     * @param sortKey created
     * @param limit number of items to return
     * @param forward true for ascending, false for descending
     * @param filterKey key to filter by
     * @param filterValue value to filter by
     * @param atts array of attributes to return
     * @returns data objects in the time range
     */
    queryByIdWithDate(
        pValue: string,
        sTimestamp: number,
        eTimestamp: number,
        atts?: string[],
        sortKey?: any,
        limit?: number,
        forward?: boolean,
        filterKey?: string,
        filterValue?: any,
    ) {
        const start = new Date(sTimestamp * 1000).toISOString()
        const end = new Date(eTimestamp * 1000).toISOString()
        const lastKeyValue = {}
        lastKeyValue[this.mainIndex.pKey] = pValue
        lastKeyValue[this.mainIndex.sKey] = sortKey
        return AwsCrudFunctions.queryData({
            TableName: this.tableName,
            indexData: this.mainIndex,
            defineDataParam: this.defineDataParam,
            pValue,
            atts,
            start,
            end,
            limit,
            forward,
            all: false,
            filterKey,
            filterValue,
            lastEvaluatedKey: sortKey == null ? null : lastKeyValue,
        })
    }
}
