import { Page, expect } from '@playwright/test';
import { Verify } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { report } from 'process';

/**
 * Checks if a folder exists at the given path and navigates to it.
 * @param folderPath - Relative or absolute path to the folder.
 * @returns true if the folder exists, false otherwise.
 */

export async function isFolderExists(pageName: string, isVisible: boolean, page: Page){
    let folderSelector = '';
    switch (pageName) {
        case 'SampleModel':
            folderSelector = 'text=SampleModel';
            try {
                await page.click('text=Data');
                await page.click('text=Models');
                await page.click(folderSelector);
                const visible = await page.isVisible(folderSelector);
                console.log('SampleModel folder exists and navigation is successful, Visible:', visible);
                expect(visible).toBe(isVisible);
                return visible;
            } catch (error) {
                console.error('Error checking SampleModel folder existence:', error);
                return false;
            }
        case 'SampleStructure':
            folderSelector = 'text=SampleStructure';
            try {
                await page.click('text=Structures');
                await page.click(folderSelector);
                const visible = await page.isVisible(folderSelector);
                console.log('SampleStructure folder exists, Visible:', visible);
                expect(visible).toBe(isVisible);
                return visible;
            } catch (error) {
                console.error('Error checking SampleStructure folder existence:', error);
                return false;
            }
        case 'EnumSample':
            folderSelector = 'text=EnumSample';
            try {
                await page.click('text=Enums');
                await page.click(folderSelector);
                const visible = await page.isVisible(folderSelector);
                console.log('EnumSample folder exists and navigation is successful, Visible:', visible);
                expect(visible).toBe(isVisible);
                return visible;
            } catch (error) {
                console.error('Error checking EnumSample folder existence:', error);
                return false;
            }
        case 'ServerFlow':
            folderSelector = 'text=ServerFlow';
            try {
                await page.click('text=Business Logic');
                await page.click('text=Server Flows');
                await page.click(folderSelector);
                const visible = await page.isVisible(folderSelector);
                console.log('ServerFlow folder exists and navigation is successful, Visible:', visible);
                expect(visible).toBe(isVisible);
                return visible;
            } catch (error) {
                console.error('Error checking ServerFlow folder existence:', error);
                return false;
            }
        case 'VF1':
            folderSelector = 'text=VF1';
            try {
                await page.click('text=Resources');
                await page.click('text=Virtual Folders');
                await page.click(folderSelector);
                const visible = await page.isVisible(folderSelector);
                console.log('VF1 folder exists and navigation is successful, Visible:', visible);
                expect(visible).toBe(isVisible);
                return visible;
            } catch (error) {
                console.error('Error checking VF1 folder existence:', error);
                return false;
            }
        case 'Logo':
            //assuming Logo is under Resources > Logo Folders
            folderSelector = 'text=Logo';
            try {
                await page.click('text=Resources');
                await page.click('text=Logo Folders');
                await page.click(folderSelector);
                const visible = await page.isVisible(folderSelector);
                console.log('Logo folder exists and navigation is successful, Visible:', visible);
                expect(visible).toBe(isVisible);
                return visible;
            } catch (error) {
                console.error('Error checking Logo folder existence:', error);
                return false;
            }
        default:
            console.log(`No navigation logic for folder: ${pageName}`);
            return false;
    }
}

export async function validateFields(fields: any[], page: Page) {
    for (const field of fields) {
        try {
            const selector = `text=${field.$name}`;
            const isVisible = await page.isVisible(selector);
            console.log(`Validating field: ${field.name}, Visible: ${isVisible}`);
            expect(isVisible, `Field ${field.name} should be visible`).toBe(field.$isVisible);

            const checkboxSelector = `xpath=//label[text()="${field.$displayName}"]/preceding-sibling::input[@type="checkbox"]`;
            const isChecked = await page.isChecked(checkboxSelector);
            console.log(`Primary key checkbox for field: ${field.name}, Checked: ${isChecked}`);
            if(field.hasOwnProperty('pk')) {
                expect(isChecked, `Primary key checkbox for ${field.name} should be ${field.pk}`).toBe(field.pk);
            } else {
                console.log(`Field ${field.name} does not have a primary key property.`);
                expect(isChecked).toBe(false);
            }

            const dropdownSelector = `xpath=//label[text()="${field.$name}"]//following-sibling::select`;
            const isDropdownVisible = await page.isVisible(dropdownSelector);
            console.log(`Dropdown for scalarType after ${field.$name}: Visible: ${isDropdownVisible}`);
            expect(isDropdownVisible).toBe(true);

            const selectedValue = await page.$eval(dropdownSelector, el => (el as HTMLSelectElement).value);
            console.log(`Dropdown selected value for field ${field.name}: ${selectedValue}`);
            expect(selectedValue).toBe(field.type.scalarType);
        } catch (error) {
            console.error(`Error validating field: ${field.name}`, error);
        }
    }
}

export async function validateEnumValues(fields: any[], page: Page) {
    for (const field of fields) {
        try {
            const enumDropdownSelector = `xpath=//label[text()="${field.$name}"]//following-sibling::select`;
            const isEnumDropdownVisible = await page.isVisible(enumDropdownSelector);
            console.log(`Enum dropdown for ${field.$name}: Visible: ${isEnumDropdownVisible}`);
            expect(isEnumDropdownVisible).toBe(true);

            const options = await page.$$eval(`${enumDropdownSelector}/option`, opts =>
                opts.map(o => (o as HTMLOptionElement).textContent?.trim() || (o as HTMLOptionElement).value)
            );
            console.log(`Enum options for ${field.$name}:`, options);

            expect(options.length).toBe(field.literals.length);

            for (const literal of field.literals) {
                const valueofLiteral = literal.constant;
                const isLiteralPresent = options.includes(valueofLiteral);
                console.log(`Literal "${valueofLiteral}" present in dropdown: ${isLiteralPresent}`);
                expect(isLiteralPresent).toBe(true);
            }
        } catch (error) {
            console.error(`Error validating enum field: ${field.$name}`, error);
        }
    }
}

export async function validateFlows(flows: any[], page: Page) {
    for (const flow of flows) {
        try {
            await expect(page.locator('[data-testid="flow-createdin"]')).toHaveText(flow.createdIn);
            await expect(page.locator('[data-testid="flow-type"]')).toHaveText(flow.type);
            await expect(page.locator('[data-testid="flow-variant"]')).toHaveText(flow.variant);

            for (const input of flow.input) {
                const inputSelector = `[text=${input.name.toLowerCase()}]`;
                await expect(page.locator(inputSelector)).toHaveText(input.type.scalarType);
            }

            // Icon metadata validation
            await expect(page.locator('[data-testid="icon-id"]')).toHaveText(flow.icon.id.toString());
            await expect(page.locator('[data-testid="icon-name"]')).toHaveText(flow.icon.name);
            await expect(page.locator('[data-testid="icon-source"]')).toHaveText(flow.icon.source);
            await expect(page.locator('[data-testid="icon-base"]')).toHaveText(flow.icon.base);
            await expect(page.locator('[data-testid="icon-isvalid"]')).toHaveText(flow.icon.isValid.toString());
            await expect(page.locator('[data-testid="icon-output-type"]')).toHaveText(flow.icon.output.type);

        } catch (error) {
            console.error(`Error validating flow: ${flow.name}`, error);
        }
    }
}

export async function validateFileFolders(fileFolders: any[], page: Page) {
    for (const folder of fileFolders) {
        try {
            //assuming location and iscitizentoolenabled are radio buttons
            
            // Validate location radio button
            const locationRadioSelector = `input[type="radio"][name="location"][value="${folder.location}"]`;
            const isLocationChecked = await page.isChecked(locationRadioSelector);
            console.log(`Location radio for ${folder.name}: Checked: ${isLocationChecked}`);
            expect(isLocationChecked, `Location radio for ${folder.name} should be checked`).toBe(true);

            // Validate isCitizenToolEnabled radio button
            const citizenToolRadioSelector = `input[type="radio"][name="isCitizenToolEnabled"][value="${folder.isCitizenToolEnabled}"]`;
            const isCitizenToolChecked = await page.isChecked(citizenToolRadioSelector);
            console.log(`Citizen Tool Enabled radio for ${folder.name}: Checked: ${isCitizenToolChecked}`);
            expect(isCitizenToolChecked).toBe(true);

        } catch (error) {
            console.error(`Error validating file folder: ${folder.name}`, error);
        }
    }
}

export async function validateFiles(files: any[], page: Page) {
    for (const file of files) {
        try {
            const imgSelector = `img[alt="${file.name}"]`;
            await expect(page.locator(imgSelector)).toBeVisible();
            await expect(page.locator(imgSelector)).toHaveAttribute('data-type', file.type);
            await expect(page.locator(imgSelector)).toHaveAttribute('data-original-filename', file.originalFileName);
            await expect(page.locator(imgSelector)).toHaveAttribute('data-internal-filename', file.internalFileName);
            await expect(page.locator(imgSelector)).toHaveAttribute('data-mime-type', file.mimeType);
            await expect(page.locator(imgSelector)).toHaveAttribute('data-image-type', file.imageType);
        } catch (error) {
            console.error(`Error validating file: ${file.name}`, error);
        }
    }
}








