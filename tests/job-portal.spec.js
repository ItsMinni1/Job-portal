const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:5173'; // Vite default

test.describe('Job Portal Happy Path', () => {

    // Unique users for each run
    const timestamp = Date.now();
    const employerUser = `emp_${timestamp}`;
    const seekerUser = `seek_${timestamp}`;
    const password = 'password123';
    const jobTitle = `Software Engineer ${timestamp}`;

    test('Full Flow: Employer Post -> Seeker Apply -> Employer Accept', async ({ browser }) => {
        // 1. Employer Registration & Post Job
        const employerContext = await browser.newContext();
        const employerPage = await employerContext.newPage();

        await employerPage.goto(BASE_URL);
        await employerPage.click('text=I\'m an Employer');
        await employerPage.fill('input[placeholder="Username"]', employerUser);
        await employerPage.fill('input[placeholder="Password"]', password);

        // Debug: Log console errors
        employerPage.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

        await employerPage.click('button:has-text("Sign Up As Employer")');

        // Should be at dashboard
        // Check for error message if redirect fails
        const errorMsg = await employerPage.locator('div[style*="color: red"]').textContent().catch(() => null);
        if (errorMsg) console.log(`REGISTRATION ERROR: ${errorMsg}`);

        await expect(employerPage).toHaveURL(/.*dashboard/);
        await expect(employerPage.locator('h2')).toContainText('Employer Dashboard');

        // Post Job
        await employerPage.click('button:has-text("Post New Job")');
        await employerPage.fill('input[placeholder="Job Title"]', jobTitle);
        await employerPage.fill('textarea[placeholder="Job Description"]', 'Great job description.');
        await employerPage.click('form >> button:has-text("Post Job")');

        // precise assertions
        await expect(employerPage.locator(`text=${jobTitle}`)).toBeVisible();

        // Logout or just close context
        await employerContext.close();

        // 2. Jobseeker Registration & Apply
        const seekerContext = await browser.newContext();
        const seekerPage = await seekerContext.newPage();

        await seekerPage.goto(BASE_URL);
        await seekerPage.click('text=I\'m a Job Seeker');
        await seekerPage.fill('input[placeholder="Username"]', seekerUser);
        await seekerPage.fill('input[placeholder="Password"]', password);
        await seekerPage.click('button:has-text("Sign Up As Job Seeker")');

        await expect(seekerPage).toHaveURL(/\/dashboard/);
        await expect(seekerPage.locator('h2')).toContainText('Job Seeker Dashboard');

        // Search Job
        await seekerPage.fill('input[placeholder="Search by title or description..."]', jobTitle);
        // Wait for list to update
        await expect(seekerPage.locator(`h4:has-text("${jobTitle}")`)).toBeVisible();

        // Apply
        await seekerPage.click(`div:has-text("${jobTitle}") >> button:has-text("Apply Now")`);
        await seekerPage.fill('textarea', 'My Resume Text');
        await seekerPage.click('button:has-text("Submit Application")');

        // Check "Applied" status button disabled
        await expect(seekerPage.locator(`div:has-text("${jobTitle}") >> button:disabled`)).toHaveText('Applied');

        // Check "My Applications" list has pending status
        await expect(seekerPage.locator('div.card:has-text("My Applications")')).toContainText(jobTitle);
        await expect(seekerPage.locator('div.card:has-text("My Applications")')).toContainText('PENDING');

        // 3. Employer Reviews Application
        const employerContext2 = await browser.newContext();
        const employerPage2 = await employerContext2.newPage();

        // Login
        await employerPage2.goto(`${BASE_URL}/login`);
        await employerPage2.fill('input[placeholder="Username"]', employerUser);
        await employerPage2.fill('input[placeholder="Password"]', password);
        await employerPage2.click('button:has-text("Login")');

        await employerPage2.click(`div:has-text("${jobTitle}") >> button:has-text("View Applications")`);

        // Update Status to Accepted
        // Update Status to Accepted
        const row = employerPage2.locator('tr', { hasText: seekerUser });
        await expect(row).toBeVisible();
        await row.locator('button:has-text("Accept")').click();

        // Verify status change in employer view
        await expect(employerPage2.locator('span:has-text("ACCEPTED")')).toBeVisible();

        await employerContext2.close();

        // 4. Seeker checks status & Updates Profile
        await seekerPage.reload();
        await expect(seekerPage.locator('div.card:has-text("My Applications")')).toContainText('ACCEPTED');

        // Update Profile
        await seekerPage.click('button:has-text("Edit Profile")');
        await seekerPage.fill('input[name="full_name"]', 'John Doe');
        await seekerPage.fill('textarea[name="bio"]', 'Experienced Developer');
        await seekerPage.fill('input[name="skills"]', 'React, Node, Testing');
        await seekerPage.click('button:has-text("Save Profile")');
        // Handle alert
        seekerPage.on('dialog', dialog => dialog.dismiss());

        await seekerContext.close();

        // 5. Employer Views Report
        const employerContext3 = await browser.newContext();
        const employerPage3 = await employerContext3.newPage();
        await employerPage3.goto(`${BASE_URL}/login`);
        await employerPage3.fill('input[placeholder="Username"]', employerUser);
        await employerPage3.fill('input[placeholder="Password"]', password);
        await employerPage3.click('button:has-text("Login")');

        await employerPage3.click('button:has-text("Reports")');

        // Verify Report Data
        await expect(employerPage3.locator('table')).toContainText(jobTitle);
        await expect(employerPage3.locator('table')).toContainText(seekerUser);
        await expect(employerPage3.locator('table')).toContainText('John Doe'); // Profile data
        await expect(employerPage3.locator('table')).toContainText('React, Node, Testing'); // Skills

        await employerContext3.close();
    });
});
