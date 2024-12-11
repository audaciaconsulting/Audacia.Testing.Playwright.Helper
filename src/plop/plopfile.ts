import path from 'path';
import { NodePlopAPI } from 'plop';

export default function (plop: NodePlopAPI) {
  plop.setHelper('capitalizeFirst', function (text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  });

  plop.setHelper('lowerCaseFirst', function (text) {
    return text.charAt(0).toLowerCase() + text.slice(1);
  });

  plop.setGenerator('POM', {
    descriptio
          return 'Please use PascalCase for the POM name (e.g., BookDetails).';
        },
      },
      {
        name: 'addTestFile',
        type: 'confirm',
        message: 'Do you want to create a test file for this page?',
        default: false,
      },
    ],
    actions: function (data) {
      const actions = [
        {
          type: 'add',
          path: path.join(process.cwd(), 'pages/{{lowerCaseFirst name}}.page.ts'),
          templateFile: 'templates/pom.hbs',
        },
        {
          type: 'modify',
          path: path.join(process.cwd(), 'fixtures/baseTest.ts'),
          pattern: /(\/\/ Import Page Objects\s+)/g,
          template: '$1import {{name}}Page from \'@pages/{{lowerCaseFirst name}}.page\';\n',
        },
        {
          type: 'modify',
          path: path.join(process.cwd(), 'fixtures/baseTest.ts'),
          pattern: /(export type MyFixtures = {[^}]*)(};)/g,
          template: '$1  {{lowerCaseFirst name}}Page: {{name}}Page;\n$2',
        },
        {
          type: 'modify',
          path: path.join(process.cwd(), 'fixtures/baseTest.ts'),
          pattern: /(\/\/ Pages\s+\s+)/g,
          template: '$1{{lowerCaseFirst name}}Page: async ({ page }, use) => {\n    await use(new {{name}}Page(page));\n  },\n  ',
        },
      ];

      if (data?.addTestFile) {
        actions.push(
          {
            type: 'add',
            path: path.join(process.cwd(), 'tests/e2e-tests/{{lowerCaseFirst name}}.spec.ts'),
            templateFile: 'templates/e2e-test.hbs',
          },
        );
      }

      return actions;
    },
  });

  plop.setGenerator('ApiTest', {
    description: 'Create API test files, directories, endpoints and add to fixtures',
    prompts: [
      {
        name: 'name',
        type: 'input',
        message: 'API test name please: (Please use PascalCasing):',
        validate: function (value) {
          if (/^[A-Z][A-Za-z0-9]+$/.test(value)) { // Ensures PascalCase
            return true;
          }
          return 'Please use PascalCase for the API test name (e.g., BookDetails).';
        },
      },
      {
        name: 'methods',
        type: 'checkbox',
        message: 'Select the HTTP methods you want to create tests for:',
        choices: [
          { name: 'GET', value: 'get' },
          { name: 'POST', value: 'post' },
          { name: 'PUT', value: 'put' },
          { name: 'DELETE', value: 'delete' },
        ],
        validate: function (answer) {
          if (answer.length < 1) {
            return 'You must choose at least one HTTP method.';
          }
          return true;
        },
      },
      {
        name: 'addEndpoint',
        type: 'confirm',
        message: 'Do you want to create an endpoint file?',
        default: false,
      },
      {
        when: function (data) {
          return data.addEndpoint;
        },
        name: 'addEndpointTypesFile',
        type: 'confirm',
        message: 'Create endpoint types file?',
        default: false,
      },
    ],
    actions: function (data) {
      const actions = [];

      // Conditionally add test files for each selected HTTP method
      data?.methods.forEach((method: string) => {
        actions.push({
          type: 'add',
          path: path.join(process.cwd(), 'tests/api-tests/{{lowerCaseFirst name}}/{{lowerCase name}}.{{method}}.spec.ts'),
          templateFile: 'templates/api-test.hbs',
          data: {
            method, // Pass the current method to the template
            name: data.name,
          },
          abortOnFail: true, // Abort if the file already exists or fails to add
        });
      });

      if (data?.addEndpoint) {
        actions.push(
          {
            type: 'add',
            path: path.join(process.cwd(), 'api/endpoints/{{lowerCaseFirst name}}.api.ts'),
            templateFile: 'templates/api-endpoint.hbs',
          },
          {
            type: 'modify',
            path: path.join(process.cwd(), 'api/api.ts'),
            pattern: /(import .+';)(?![\s\S]*import .+';)/, // Matches the last import statement
            template: '$1\nimport {{ name }} from \'./endpoints/{{lowerCaseFirst name}}.api\';',
          },
          {
            type: 'modify',
            path: path.join(process.cwd(), 'api/api.ts'),
            pattern: /(request: APIRequestContext;\s+)/, // Matches the line with 'request: APIRequestContext;'
            template: '$1readonly {{lowerCase name}}: {{name}};\n  ',
          },
          {
            type: 'modify',
            path: path.join(process.cwd(), 'api/api.ts'),
            pattern: /(constructor\(request: APIRequestContext\) {\s+)/, // Matches the line with 'constructor(request: APIRequestContext) {'
            template: '$1this.{{lowerCase name}} = new {{name}}(request);\n    ',
          },
        );

        if (data.addEndpointTypesFile) {
          actions.push(
            {
              type: 'add',
              path: path.join(process.cwd(), 'types/endpoints/{{lowerCaseFirst name}}.apitypes.ts'),
              templateFile: 'templates/api-endpoint-types.hbs',
            },
            {
              type: 'modify',
              path: path.join(process.cwd(), 'types/APISchemaTypes.ts'),
              pattern: /(import .+';)(?![\s\S]*import .+';)/, // Matches the last import statement
              template: '$1\nimport * as {{ name }} from \'@apiTypes/endpoints/{{lowerCaseFirst name}}.apitypes\';',
            },
            {
              type: 'modify',
              path: path.join(process.cwd(), 'types/APISchemaTypes.ts'),
              pattern: /(export type APIResponseNames =\s+)/,
              template: '$1{{ name }}.ResponseNames |\n  ',
            },
            {
              type: 'modify',
              path: path.join(process.cwd(), 'types/APISchemaTypes.ts'),
              pattern: /(export {\s+)/,
              template: '$1{{ name }},\n  ',
            },
          );
        }
      }

      return actions;
    },
  });
}
