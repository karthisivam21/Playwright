npx playwright test
  npx playwright show-report

  ## allure report
npm install allure-commandline --save-dev
npx allure generate allure-results --clean -o allure-report
npx allure-commandline open allure-report

## validation and folder navigation are implemented in ../util/commonFn.spec
## parsing JSON implemented in ../util/parseJson.spec

# json file is stored under data folder structure 

# and in test json Resources iteration happened and for each key test is created and validation happened

## added allure report for reporting purpose 
