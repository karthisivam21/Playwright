import { test, expect, Page } from '@playwright/test';
import { parseJson } from '../util/parseJson.spec';
import * as commonFn from '../util/commonFn.spec';

try {
const resources = parseJson('QAChallengeJSON.json');
expect(resources).toBeDefined();


Object.keys(resources).forEach(key => {
    const items = resources[key];
    if(items.length > 0) {
        test(`Verify UI Elements for key: ${key}`, async ({ page }) => {
            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);

            console.log(`Key: ${key}, Value: ${items.length} items`);
            const insideKeys = Object.keys(items[0]);
            console.log(`Inside Keys: ${insideKeys}`);
            insideKeys.forEach(insideKey => {
                console.log(`Inside Key: ${insideKey}, Value: ${items[0][insideKey]}`);
            });
            
           await page.goto('https://example.com'); // Replace with actual URL

           //page navigation based on the first item's $displayName
            console.log(`Navigating to: ${items[0].$displayName}`);
            const displayName = items[0].$displayName;
            const isVisible = items[0].$isVisible;
            if (displayName) {
                const parts = displayName.split('/');
                parts.forEach(async (part, idx) => {
                    console.log(`Part ${idx + 1}: ${part}`);
                    const folderExists = await commonFn.isFolderExists(part.trim(), isVisible, page);
                    if (folderExists) {
                        console.log(`${part} folder exists and navigation is successful`);
                        await page.screenshot({ path: `screenshots/${part}_exists.png` });
                    } else {
                        console.log(`${part} folder does NOT exist or navigation failed`);
                        await page.screenshot({ path: `screenshots/${part}_not_exists.png` });
                    }
                });
            }

            // Validate fields
            if(items[0].$type == 'EntityDef') {
                console.log(`Validating fields for key: ${key}`);
                await commonFn.validateFields(items[0].fields, page);
                await page.screenshot({path : `screenshots/${key}_fields_validation.png`});
            } else if(items[0].$type == 'EnumDef') {
                console.log(`Validating enum fields for key: ${key}`);
                await commonFn.validateEnumValues(items[0], page);
                await page.screenshot({path : `screenshots/${key}_enum_fields_validation.png`});    
            } else if(items[0].$type == 'Flow') {
                console.log(`Validating flow for key: ${key}`);
                await commonFn.validateFlows(items[0], page);
                await page.screenshot({path : `screenshots/${key}_flow_validation.png`});
            } else if(items[0].$type == 'FileFolder') {
                console.log(`Validating file folder for key: ${key}`);
                await commonFn.validateFileFolders(items[0], page);
                await page.screenshot({path : `screenshots/${key}_filefolder_validation.png`});
            } else if(items[0].$type == 'FileResource') {
                console.log(`Validating file resource for key: ${key}`);
                await commonFn.validateFiles(items[0], page);
                await page.screenshot({path : `screenshots/${key}_fileresource_validation.png`});
            }
            console.log(`Test completed for key: ${key}`);
        });
    }
});
   


}catch (error) {
    console.error('Error during test execution:', error);
}
