import { describe, expect, it } from 'vitest'
import { parseSoqlQuery } from '../../src/helpers'
import { SoqlParserError } from '../../src/errors'

describe('malformed queries', () => {
    it.each([
        'SELECT Id FROM',
        'SELECT , Id FROM Account',
        'SELECT * FROM Account',
        "SELECT 'Id' FROM Account",
        'SELECT Id FROM Account;',
        'SELECT Id FROM Account, WHERE X = 1',
        'SELECT DISTINCT Name FROM Account',
        'SELECT Id FROM Account WHERE 5 = 5',
        'SELECT Id FROM Account WHERE X IN (SELECT Id, Name FROM X)',
        'SELECT Id FROM Account WHERE A = 1 AND B = 2 OR C = 3',
        'SELECT Id FROM Account WHERE A = 1 OR B = 2 AND C = 3',
        'SELECT Id FROM Account WHERE A = 1 OR B = 2 AND C = 3 OR D = 4',
        'SELECT Id FROM Account WHERE 1abc = 1',
        'SELECT Id,, Name FROM Account',
        'SELECT Id FROM Account a-b',
        'SELECT Id FROM 1Account',
    ])('rejects %s', (q) => {
        expect(() => parseSoqlQuery(q)).toThrow(SoqlParserError)
    })

    it.each([
        'SELECT Id FROM Account',
        'SELECT Id, Account.Owner.Name, Custom__c FROM Account a',
        'SELECT COUNT() FROM Account',
        'SELECT COUNT(Id) FROM Account',
        'SELECT Id FROM Account WHERE A = 1 AND B = 2 AND C = 3',
        'SELECT Id FROM Account WHERE A = 1 OR B = 2 OR C = 3',
        'SELECT Id FROM Account WHERE (A = 1 AND B = 2) OR C = 3',
        'SELECT Id FROM Account WHERE A = 1 AND (B = 2 OR C = 3)',
        'SELECT Id FROM Account WHERE Id IN (SELECT AccountId FROM Contact)',
        'SELECT Id, (SELECT Id, Name FROM Contacts) FROM Account',
    ])('accepts %s', (q) => {
        expect(() => parseSoqlQuery(q)).not.toThrow()
    })

    it('names the offending identifier', () => {
        expect(() => parseSoqlQuery('SELECT Id FROM Account;')).toThrow(
            /Account;/,
        )
        expect(() => parseSoqlQuery('SELECT * FROM Account')).toThrow(/\*/)
    })

    it('requires parentheses when mixing AND/OR', () => {
        expect(() =>
            parseSoqlQuery('SELECT Id FROM A WHERE A = 1 AND B = 2 OR C = 3'),
        ).toThrow(/Parentheses are required/)
    })
})
