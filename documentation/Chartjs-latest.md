
Chart.js Chart.js
Home
API
Samples
GitHub
(opens new window)

    Chart.js

    Getting Started

    General

    Configuration

    Chart Types

    Axes

    Developers

    Migration

Chart.js

Welcome to Chart.js!

    Get started with Chart.js — best if you're new to Chart.js
    Migrate from Chart.js v3 or Chart.js v2
    Join the community on Discord

and Twitter
Post a question tagged with chart.js on Stack Overflow

    Contribute to Chart.js

Why Chart.js

Among many charting libraries
for JavaScript application developers, Chart.js is currently the most popular one according to GitHub stars (~60,000) and npm downloads

(~2,400,000 weekly).

Chart.js was created and announced
in 2013 but has come a long way since then. It’s open-source, licensed under the very permissive MIT license

, and maintained by an active community.
Features

Chart.js provides a set of frequently used chart types, plugins, and customization options. In addition to a reasonable set of built-in chart types, you can use additional community-maintained chart types

. On top of that, it’s possible to combine several chart types into a mixed chart (essentially, blending multiple chart types into one on the same canvas).

Chart.js is highly customizable with custom plugins

to create annotations, zoom, or drag-and-drop functionalities to name a few things.
Defaults

Chart.js comes with a sound default configuration, making it very easy to start with and get an app that is ready for production. Chances are you will get a very appealing chart even if you don’t specify any options at all. For instance, Chart.js has animations turned on by default, so you can instantly bring attention to the story you’re telling with the data.
Integrations

Chart.js comes with built-in TypeScript typings and is compatible with all popular JavaScript frameworks
including React , Vue , Svelte , and Angular

. You can use Chart.js directly or leverage well-maintained wrapper packages that allow for a more native integration with your frameworks of choice.
Developer experience

Chart.js has very thorough documentation (yes, you're reading it), API reference, and examples. Maintainers and community members eagerly engage in conversations on Discord
, GitHub Discussions , and Stack Overflow

where more than 11,000 questions are tagged with chart.js.
Canvas rendering

Chart.js renders chart elements on an HTML5 canvas unlike several others, mostly D3.js-based, charting libraries that render as SVG. Canvas rendering makes Chart.js very performant, especially for large datasets and complex visualizations that would otherwise require thousands of SVG nodes in the DOM tree. At the same time, canvas rendering disallows CSS styling, so you will have to use built-in options for that, or create a custom plugin or chart type to render everything to your liking.
Performance

Chart.js is very well suited for large datasets. Such datasets can be efficiently ingested using the internal format, so you can skip data parsing and normalization. Alternatively, data decimation can be configured to sample the dataset and reduce its size before rendering.

In the end, the canvas rendering that Chart.js uses reduces the toll on your DOM tree in comparison to SVG rendering. Also, tree-shaking support allows you to include minimal parts of Chart.js code in your bundle, reducing bundle size and page load time.
Community

Chart.js is actively developed
and maintained by the community. With minor releases

on an approximately bi-monthly basis and major releases with breaking changes every couple of years, Chart.js keeps the balance between adding new features and making it a hassle to keep up with them.
Last Updated: 12/1/2024, 4:35:13 PM

Getting Started →


Getting Started

Let's get started with Chart.js!

    Follow a step-by-step guide to get up to speed with Chart.js
    Install Chart.js from npm or a CDN
    Integrate Chart.js with bundlers, loaders, and front-end frameworks

Alternatively, see the example below or check samples.
Create a Chart

In this example, we create a bar chart for a single dataset and render it on an HTML page. Add this code snippet to your page:

<div>
  <canvas id="myChart"></canvas>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
  const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
</script>

 

 
        Copied!
    

You should get a chart like this:

demo

Let's break this code down.

First, we need to have a canvas in our page. It's recommended to give the chart its own container for responsiveness.

<div>
  <canvas id="myChart"></canvas>
</div>

 

 
        Copied!
    

Now that we have a canvas, we can include Chart.js from a CDN.

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

 

 
        Copied!
    

Finally, we can create a chart. We add a script that acquires the myChart canvas element and instantiates new Chart with desired configuration: bar chart type, labels, data points, and options.

<script>
  const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
</script>

 

 
        Copied!
    

You can see all the ways to use Chart.js in the step-by-step guide.

Installation
npm

npm npm

npm install chart.js

 

 
        Copied!
    

CDN
CDNJS

cdnjs

Chart.js built files are available on CDNJS

:

https://cdnjs.com/libraries/Chart.js

jsDelivr

jsdelivr jsdelivr hits

Chart.js built files are also available through jsDelivr

:

https://www.jsdelivr.com/package/npm/chart.js?path=dist

GitHub

github

You can download the latest version of Chart.js on GitHub

.

If you download or clone the repository, you must build Chart.js to generate the dist files. Chart.js no longer comes with prebuilt release versions, so an alternative option to downloading the repo is strongly advised.


Integration

Chart.js can be integrated with plain JavaScript or with different module loaders. The examples below show how to load Chart.js in different systems.

If you're using a front-end framework (e.g., React, Angular, or Vue), please see available integrations

.
Script Tag

<script src="path/to/chartjs/dist/chart.umd.js"></script>
<script>
    const myChart = new Chart(ctx, {...});
</script>

 

 
        Copied!
    

Bundlers (Webpack, Rollup, etc.)

Chart.js is tree-shakeable, so it is necessary to import and register the controllers, elements, scales and plugins you are going to use.
Quick start

If you don't care about the bundle size, you can use the auto package ensuring all features are available:

import Chart from 'chart.js/auto';

 

 
        Copied!
    

Bundle optimization

When optimizing the bundle, you need to import and register the components that are needed in your application.

The options are categorized into controllers, elements, plugins, scales. You can pick and choose many of these, e.g. if you are not going to use tooltips, don't import and register the Tooltip plugin. But each type of chart has its own bare-minimum requirements (typically the type's controller, element(s) used by that controller and scale(s)):

    Bar chart
        BarController
        BarElement
        Default scales: CategoryScale (x), LinearScale (y)
    Bubble chart
        BubbleController
        PointElement
        Default scales: LinearScale (x/y)
    Doughnut chart
        DoughnutController
        ArcElement
        Not using scales
    Line chart
        LineController
        LineElement
        PointElement
        Default scales: CategoryScale (x), LinearScale (y)
    Pie chart
        PieController
        ArcElement
        Not using scales
    PolarArea chart
        PolarAreaController
        ArcElement
        Default scale: RadialLinearScale (r)
    Radar chart
        RadarController
        LineElement
        PointElement
        Default scale: RadialLinearScale (r)
    Scatter chart
        ScatterController
        PointElement
        Default scales: LinearScale (x/y)

Available plugins:

    Decimation
    Filler - used to fill area described by LineElement, see Area charts
    Legend
    SubTitle
    Title
    Tooltip

Available scales:

    Cartesian scales (x/y)
        CategoryScale
        LinearScale
        LogarithmicScale
        TimeScale
        TimeSeriesScale

    Radial scales (r)
        RadialLinearScale

Helper functions

If you want to use the helper functions, you will need to import these separately from the helpers package and use them as stand-alone functions.

Example of Converting Events to Data Values using bundlers.

import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';

const chart = new Chart(ctx, {
  type: 'line',
  data: data,
  options: {
    onClick: (e) => {
      const canvasPosition = getRelativePosition(e, chart);

      // Substitute the appropriate scale IDs
      const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
      const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
    }
  }
});

 

 
        Copied!
    

CommonJS

Because Chart.js is an ESM library, in CommonJS modules you should use a dynamic import:

const { Chart } = await import('chart.js');

 

 
        Copied!
    

RequireJS

Important: RequireJS can load only AMD modules

, so be sure to require one of the UMD builds instead (i.e. dist/chart.umd.js).

require(['path/to/chartjs/dist/chart.umd.js'], function(Chart){
    const myChart = new Chart(ctx, {...});
});

 

 
        Copied!
    

Note

In order to use the time scale, you need to make sure one of the available date adapters

and corresponding date library are fully loaded after requiring Chart.js. For this you can use nested requires:

require(['chartjs'], function(Chart) {
    require(['moment'], function() {
        require(['chartjs-adapter-moment'], function() {
            new Chart(ctx, {...});
        });
    });
});

 

 

 Step-by-step guide

Follow this guide to get familiar with all major concepts of Chart.js: chart types and elements, datasets, customization, plugins, components, and tree-shaking. Don't hesitate to follow the links in the text.

We'll build a Chart.js data visualization with a couple of charts from scratch:

result
Build a new application with Chart.js

In a new folder, create the package.json file with the following contents:

{
  "name": "chartjs-example",
  "version": "1.0.0",
  "license": "MIT",
  "scripts": {
    "dev": "parcel src/index.html",
    "build": "parcel build src/index.html"
  },
  "devDependencies": {
    "parcel": "^2.6.2"
  },
  "dependencies": {
    "@cubejs-client/core": "^0.31.0",
    "chart.js": "^4.0.0"
  }
}

 

 
        Copied!
    

Modern front-end applications often use JavaScript module bundlers, so we’ve picked Parcel
as a nice zero-configuration build tool. We’re also installing Chart.js v4 and a JavaScript client for Cube

, an open-source API for data apps we’ll use to fetch real-world data (more on that later).

Run npm install, yarn install, or pnpm install to install the dependencies, then create the src folder. Inside that folder, we’ll need a very simple index.html file:

<!doctype html>
<html lang="en">
  <head>
    <title>Chart.js example</title>
  </head>
  <body>
    <!-- <div style="width: 500px;"><canvas id="dimensions"></canvas></div><br/> -->
    <div style="width: 800px;"><canvas id="acquisitions"></canvas></div>

    <!-- <script type="module" src="dimensions.js"></script> -->
    <script type="module" src="acquisitions.js"></script>
  </body>
</html>

 

 
        Copied!
    

As you can see, Chart.js requires minimal markup: a canvas tag with an id by which we’ll reference the chart later. By default, Chart.js charts are responsive and take the whole enclosing container. So, we set the width of the div to control chart width.

Lastly, let’s create the src/acquisitions.js file with the following contents:

import Chart from 'chart.js/auto'

(async function() {
  const data = [
    { year: 2010, count: 10 },
    { year: 2011, count: 20 },
    { year: 2012, count: 15 },
    { year: 2013, count: 25 },
    { year: 2014, count: 22 },
    { year: 2015, count: 30 },
    { year: 2016, count: 28 },
  ];

  new Chart(
    document.getElementById('acquisitions'),
    {
      type: 'bar',
      data: {
        labels: data.map(row => row.year),
        datasets: [
          {
            label: 'Acquisitions by year',
            data: data.map(row => row.count)
          }
        ]
      }
    }
  );
})();

 

 
        Copied!
    

Let’s walk through this code:

    We import Chart, the main Chart.js class, from the special chart.js/auto path. It loads all available Chart.js components (which is very convenient) but disallows tree-shaking. We’ll address that later.
    We instantiate a new Chart instance and provide two arguments: the canvas element where the chart would be rendered and the options object.
    We just need to provide a chart type (bar) and provide data which consists of labels (often, numeric or textual descriptions of data points) and an array of datasets (Chart.js supports multiple datasets for most chart types). Each dataset is designated with a label and contains an array of data points.
    For now, we only have a few entries of dummy data. So, we extract year and count properties to produce the arrays of labels and data points within the only dataset.

Time to run the example with npm run dev, yarn dev, or pnpm dev and navigate to localhost:1234

in your web browser:

result

With just a few lines of code, we’ve got a chart with a lot of features: a legend, grid lines, ticks, and tooltips shown on hover. Refresh the web page a few times to see that the chart is also animated. Try clicking on the “Acquisitions by year” label to see that you’re also able to toggle datasets visibility (especially useful when you have multiple datasets).
Simple customizations

Let’s see how Chart.js charts can be customized. First, let’s turn off the animations so the chart appears instantly. Second, let’s hide the legend and tooltips since we have only one dataset and pretty trivial data.

Replace the new Chart(...); invocation in src/acquisitions.js with the following snippet:

  new Chart(
    document.getElementById('acquisitions'),
    {
      type: 'bar',
      options: {
        animation: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        }
      },
      data: {
        labels: data.map(row => row.year),
        datasets: [
          {
            label: 'Acquisitions by year',
            data: data.map(row => row.count)
          }
        ]
      }
    }
  );

 

 
        Copied!
    

As you can see, we’ve added the options property to the second argument—that’s how you can specify all kinds of customization options for Chart.js. The animation is disabled with a boolean flag provided via animation. Most chart-wide options (e.g., responsiveness or device pixel ratio) are configured like this.

The legend and tooltips are hidden with boolean flags provided under the respective sections in plugins. Note that some of Chart.js features are extracted into plugins: self-contained, separate pieces of code. A few of them are available as a part of Chart.js distribution
, other plugins are maintained independently and can be located in the awesome list

of plugins, framework integrations, and additional chart types.

You should be able to see the updated minimalistic chart in your browser.
Real-world data

With hardcoded, limited-size, unrealistic data, it’s hard to show the full potential of Chart.js. Let’s quickly connect to a data API to make our example application closer to a production use case.

Let’s create the src/api.js file with the following contents:

import { CubejsApi } from '@cubejs-client/core';

const apiUrl = 'https://heavy-lansford.gcp-us-central1.cubecloudapp.dev/cubejs-api/v1';
const cubeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjEwMDAwMDAwMDAsImV4cCI6NTAwMDAwMDAwMH0.OHZOpOBVKr-sCwn8sbZ5UFsqI3uCs6e4omT7P6WVMFw';

const cubeApi = new CubejsApi(cubeToken, { apiUrl });

export async function getAquisitionsByYear() {
  const acquisitionsByYearQuery = {
    dimensions: [
      'Artworks.yearAcquired',
    ],
    measures: [
      'Artworks.count'
    ],
    filters: [ {
      member: 'Artworks.yearAcquired',
      operator: 'set'
    } ],
    order: {
      'Artworks.yearAcquired': 'asc'
    }
  };

  const resultSet = await cubeApi.load(acquisitionsByYearQuery);

  return resultSet.tablePivot().map(row => ({
    year: parseInt(row['Artworks.yearAcquired']),
    count: parseInt(row['Artworks.count'])
  }));
}

export async function getDimensions() {
  const dimensionsQuery = {
    dimensions: [
      'Artworks.widthCm',
      'Artworks.heightCm'
    ],
    measures: [
      'Artworks.count'
    ],
    filters: [
      {
        member: 'Artworks.classification',
        operator: 'equals',
        values: [ 'Painting' ]
      },
      {
        member: 'Artworks.widthCm',
        operator: 'set'
      },
      {
        member: 'Artworks.widthCm',
        operator: 'lt',
        values: [ '500' ]
      },
      {
        member: 'Artworks.heightCm',
        operator: 'set'
      },
      {
        member: 'Artworks.heightCm',
        operator: 'lt',
        values: [ '500' ]
      }
    ]
  };

  const resultSet = await cubeApi.load(dimensionsQuery);

  return resultSet.tablePivot().map(row => ({
    width: parseInt(row['Artworks.widthCm']),
    height: parseInt(row['Artworks.heightCm']),
    count: parseInt(row['Artworks.count'])
  }));
}

 

 
        Copied!
    

Let’s see what’s happening there:

    We import the JavaScript client library for Cube

, an open-source API for data apps, configure it with the API URL (apiUrl) and the authentication token (cubeToken), and finally instantiate the client (cubeApi).
Cube API is hosted in Cube Cloud
and connected to a database with a public dataset  of ~140,000 records representing all of the artworks in the collection of the Museum of Modern Art

    in New York, USA. Certainly, a more real-world dataset than what we’ve got now.
    We define a couple of asynchronous functions to fetch data from the API: getAquisitionsByYear and getDimensions. The first one returns the number of artworks by the year of acquisition, the other returns the number of artworks for every width-height pair (we’ll need it for another chart).
    Let’s take a look at getAquisitionsByYear. First, we create a declarative, JSON-based query in the acquisitionsByYearQuery variable. As you can see, we specify that for every yearAcquired we’d like to get the count of artworks; yearAcquired has to be set (i.e., not undefined); the result set would be sorted by yearAcquired in the ascending order.
    Second, we fetch the resultSet by calling cubeApi.load and map it to an array of objects with desired year and count properties.

Now, let’s deliver the real-world data to our chart. Please apply a couple of changes to src/acquisitions.js: add an import and replace the definition of the data variable.

import { getAquisitionsByYear } from './api'

// ...

const data = await getAquisitionsByYear();

 

 
        Copied!
    

Done! Now, our chart with real-world data looks like this. Looks like something interesting happened in 1964, 1968, and 2008!

result

We’re done with the bar chart. Let’s try another Chart.js chart type.
Further customizations

Chart.js supports many common chart types.

For instance, Bubble chart allows to display three dimensions of data at the same time: locations on x and y axes represent two dimensions, and the third dimension is represented by the size of the individual bubbles.

To create the chart, stop the already running application, then go to src/index.html, and uncomment the following two lines:

<div style="width: 500px;"><canvas id="dimensions"></canvas></div><br/>

<script type="module" src="dimensions.js"></script>

 

 
        Copied!
    

Then, create the src/dimensions.js file with the following contents:

import Chart from 'chart.js/auto'
import { getDimensions } from './api'

(async function() {
  const data = await getDimensions();

  new Chart(
    document.getElementById('dimensions'),
    {
      type: 'bubble',
      data: {
        labels: data.map(x => x.year),
        datasets: [
          {
            label: 'Dimensions',
            data: data.map(row => ({
              x: row.width,
              y: row.height,
              r: row.count
            }))
          }
        ]
      }
    }
  );
})();

 

 
        Copied!
    

Probably, everything is pretty straightforward there: we get data from the API and render a new chart with the bubble type, passing three dimensions of data as x, y, and r (radius) properties.

Now, reset caches with rm -rf .parcel-cache and start the application again with npm run dev, yarn dev, or pnpm dev. We can review the new chart now:

result

Well, it doesn’t look pretty.

First of all, the chart is not square. Artworks’ width and height are equally important so we’d like to make the chart width equal to its height as well. By default, Chart.js charts have the aspect ratio of either 1 (for all radial charts, e.g., a doughnut chart) or 2 (for all the rest). Let’s modify the aspect ratio for our chart:

// ...

	new Chart(
    document.getElementById('dimensions'),
    {
      type: 'bubble',
      options: {
        aspectRatio: 1,
      },

// ...

 

 
        Copied!
    

Looks much better now:

result

However, it’s still not ideal. The horizontal axis spans from 0 to 500 while the vertical axis spans from 0 to 450. By default, Chart.js automatically adjusts the range (minimum and maximum values) of the axes to the values provided in the dataset, so the chart “fits” your data. Apparently, MoMa collection doesn’t have artworks in the range of 450 to 500 cm in height. Let’s modify the axes configuration for our chart to account for that:

// ...

  new Chart(
    document.getElementById('dimensions'),
    {
      type: 'bubble',
      options: {
        aspectRatio: 1,
        scales: {
          x: {
            max: 500
          },
          y: {
            max: 500
          }
        }
      },

// ...

 

 
        Copied!
    

Great! Behold the updated chart:

result

However, there’s one more nitpick: what are these numbers? It’s not very obvious that the units are centimetres. Let’s apply a custom tick format to both axes to make things clear. We’ll provide a callback function that would be called to format each tick value. Here’s the updated axes configuration:

// ...

  new Chart(
    document.getElementById('dimensions'),
    {
      type: 'bubble',
      options: {
        aspectRatio: 1,
        scales: {
          x: {
            max: 500,
            ticks: {
              callback: value => `${value / 100} m`
            }
          },
          y: {
            max: 500,
            ticks: {
              callback: value => `${value / 100} m`
            }
          }
        }
      },

// ...

 

 
        Copied!
    

Perfect, now we have proper units on both axes:

result
Multiple datasets

Chart.js plots each dataset independently and allows to apply custom styles to them.

Take a look at the chart: there’s a visible “line” of bubbles with equal x and y coordinates representing square artworks. It would be cool to put these bubbles in their own dataset and paint them differently. Also, we can separate “taller” artworks from “wider” ones and paint them differently, too.

Here’s how we can do that. Replace the datasets with the following code:

// ...

        datasets: [
          {
            label: 'width = height',
            data: data
              .filter(row => row.width === row.height)
              .map(row => ({
                x: row.width,
                y: row.height,
                r: row.count
              }))
          },
          {
            label: 'width > height',
            data: data
              .filter(row => row.width > row.height)
              .map(row => ({
                x: row.width,
                y: row.height,
                r: row.count
              }))
          },
          {
            label: 'width < height',
            data: data
              .filter(row => row.width < row.height)
              .map(row => ({
                x: row.width,
                y: row.height,
                r: row.count
              }))
          }
        ]

// ..

 

 
        Copied!
    

As you can see, we define three datasets with different labels. Each dataset gets its own slice of data extracted with filter. Now they are visually distinct and, as you already know, you can toggle their visibility independently.

result

Here we rely on the default color palette. However, keep in mind every chart type supports a lot of dataset options that you can feel free to customize.
Plugins

Another—and very powerful!—way to customize Chart.js charts is to use plugins. You can find some in the plugin directory

or create your own, ad-hoc ones. In Chart.js ecosystem, it’s idiomatic and expected to fine tune charts with plugins. For example, you can customize canvas background or add a border to it with simple ad-hoc plugins. Let’s try the latter.

Plugins have an extensive API but, in a nutshell, a plugin is defined as an object with a name and one or more callback functions defined in the extension points. Insert the following snippet before and in place of the new Chart(...); invocation in src/dimensions.js:

// ...

  const chartAreaBorder = {
    id: 'chartAreaBorder',

    beforeDraw(chart, args, options) {
      const { ctx, chartArea: { left, top, width, height } } = chart;

      ctx.save();
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth;
      ctx.setLineDash(options.borderDash || []);
      ctx.lineDashOffset = options.borderDashOffset;
      ctx.strokeRect(left, top, width, height);
      ctx.restore();
    }
  };

  new Chart(
    document.getElementById('dimensions'),
    {
      type: 'bubble',
      plugins: [ chartAreaBorder ],
      options: {
        plugins: {
          chartAreaBorder: {
            borderColor: 'red',
            borderWidth: 2,
            borderDash: [ 5, 5 ],
            borderDashOffset: 2,
          }
        },
        aspectRatio: 1,

// ...

 

 
        Copied!
    

As you can see, in this chartAreaBorder plugin, we acquire the canvas context, save its current state, apply styles, draw a rectangular shape around the chart area, and restore the canvas state. We’re also passing the plugin in plugins so it’s only applied to this particular chart. We also pass the plugin options in options.plugins.chartAreaBorder; we could surely hardcode them in the plugin source code but it’s much more reusable this way.

Our bubble chart looks fancier now:

result
Tree-shaking

In production, we strive to ship as little code as possible, so the end users can load our data applications faster and have better experience. For that, we’ll need to apply tree-shaking

which is fancy term for removing unused code from the JavaScript bundle.

Chart.js fully supports tree-shaking with its component design. You can register all Chart.js components at once (which is convenient when you’re prototyping) and get them bundled with your application. Or, you can register only necessary components and get a minimal bundle, much less in size.

Let’s inspect our example application. What’s the bundle size? You can stop the application and run npm run build, or yarn build, or pnpm build. In a few moments, you’ll get something like this:

% yarn build
yarn run v1.22.17
$ parcel build src/index.html
✨ Built in 88ms

dist/index.html              381 B   164ms
dist/index.74a47636.js   265.48 KB   1.25s
dist/index.ba0c2e17.js       881 B    63ms
✨ Done in 0.51s.

 

 
        Copied!
    

We can see that Chart.js and other dependencies were bundled together in a single 265 KB file.

To reduce the bundle size, we’ll need to apply a couple of changes to src/acquisitions.js and src/dimensions.js. First, we’ll need to remove the following import statement from both files: import Chart from 'chart.js/auto'.

Instead, let’s load only necessary components and “register” them with Chart.js using Chart.register(...). Here’s what we need in src/acquisitions.js:

import {
  Chart,
  Colors,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Legend
} from 'chart.js'

Chart.register(
  Colors,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend
);

 

 
        Copied!
    

And here’s the snippet for src/dimensions.js:

import {
  Chart,
  Colors,
  BubbleController,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend
} from 'chart.js'

Chart.register(
  Colors,
  BubbleController,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend
);

 

 
        Copied!
    

You can see that, in addition to the Chart class, we’re also loading a controller for the chart type, scales, and other chart elements (e.g., bars or points). You can look all available components up in the documentation.

Alternatively, you can follow Chart.js advice in the console. For example, if you forget to import BarController for your bar chart, you’ll see the following message in the browser console:

Unhandled Promise Rejection: Error: "bar" is not a registered controller.

 

 
        Copied!
    

Remember to carefully check for imports from chart.js/auto when preparing your application for production. It takes only one import like this to effectively disable tree-shaking.

Now, let’s inspect our application once again. Run yarn build and you’ll get something like this:

% yarn build
yarn run v1.22.17
$ parcel build src/index.html
✨ Built in 88ms

dist/index.html              381 B   176ms
dist/index.5888047.js    208.66 KB   1.23s
dist/index.dcb2e865.js       932 B    58ms
✨ Done in 0.51s.

 

 
        Copied!
    

By importing and registering only select components, we’ve removed more than 56 KB of unnecessary code. Given that other dependencies take ~50 KB in the bundle, tree-shaking helps remove ~25% of Chart.js code from the bundle for our example application.
Next steps

Now you’re familiar with all major concepts of Chart.js: chart types and elements, datasets, customization, plugins, components, and tree-shaking.

Feel free to review many examples of charts in the documentation and check the awesome list
of Chart.js plugins and additional chart types as well as framework integrations (e.g., React, Vue, Svelte, etc.). Also, don’t hesitate to join Chart.js Discord and follow Chart.js on Twitter

.

Have fun and good luck building with Chart.js!

Accessibility

Chart.js charts are rendered on user provided canvas elements. Thus, it is up to the user to create the canvas element in a way that is accessible. The canvas element has support in all browsers and will render on screen but the canvas content will not be accessible to screen readers.

With canvas, the accessibility has to be added with ARIA attributes on the canvas element or added using internal fallback content placed within the opening and closing canvas tags.

This website

has a more detailed explanation of canvas accessibility as well as in depth examples.
Examples

These are some examples of accessible canvas elements.

By setting the role and aria-label, this canvas now has an accessible name.

<canvas id="goodCanvas1" width="400" height="100" aria-label="Hello ARIA World" role="img"></canvas>

 

 
        Copied!
    

This canvas element has a text alternative via fallback content.

<canvas id="okCanvas2" width="400" height="100">
    <p>Hello Fallback World</p>
</canvas>

 

 
        Copied!
    

These are some bad examples of inaccessible canvas elements.

This canvas element does not have an accessible name or role.

<canvas id="badCanvas1" width="400" height="100"></canvas>

 

 
        Copied!
    

This canvas element has inaccessible fallback content.

<canvas id="badCanvas2" width="400" height="100">Your browser does not support the canvas element.</canvas>

 

 

 Colors

Charts support three color options:

    for geometric elements, you can change background and border colors;
    for textual elements, you can change the font color.

Also, you can change the whole canvas background.
Default colors

If a color is not specified, a global default color from Chart.defaults is used:
Name 	Type 	Description 	Default value
backgroundColor 	
Color
	Background color 	rgba(0, 0, 0, 0.1)
borderColor 	
Color
	Border color 	rgba(0, 0, 0, 0.1)
color 	
Color
	Font color 	#666

You can reset default colors by updating these properties of Chart.defaults:

Chart.defaults.backgroundColor = '#9BD0F5';
Chart.defaults.borderColor = '#36A2EB';
Chart.defaults.color = '#000';

 

 
        Copied!
    

Per-dataset color settings

If your chart has multiple datasets, using default colors would make individual datasets indistinguishable. In that case, you can set backgroundColor and borderColor for each dataset:

const data = {
  labels: ['A', 'B', 'C'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [1, 2, 3],
      borderColor: '#36A2EB',
      backgroundColor: '#9BD0F5',
    },
    {
      label: 'Dataset 2',
      data: [2, 3, 4],
      borderColor: '#FF6384',
      backgroundColor: '#FFB1C1',
    }
  ]
};

 

 
        Copied!
    

However, setting colors for each dataset might require additional work that you'd rather not do. In that case, consider using the following plugins with pre-defined or generated palettes.
Default color palette

If you don't have any preference for colors, you can use the built-in Colors plugin. It will cycle through a palette of seven Chart.js brand colors:

Colors plugin palette

All you need is to import and register the plugin:

import { Colors } from 'chart.js';

Chart.register(Colors);

 

 
        Copied!
    

Note

If you are using the UMD version of Chart.js, this plugin will be enabled by default. You can disable it by setting the enabled option to false:

const options = {
  plugins: {
    colors: {
      enabled: false
    }
  }
};

 

 
        Copied!
    

Dynamic datasets at runtime

By default, the colors plugin only works when you initialize the chart without any colors for the border or background specified. If you want to force the colors plugin to always color your datasets, for example, when using dynamic datasets at runtime you will need to set the forceOverride option to true:

const options = {
  plugins: {
    colors: {
      forceOverride: true
    }
  }
};

 

 
        Copied!
    

Advanced color palettes

See the awesome list

for plugins that would give you more flexibility defining color palettes.
Color formats

You can specify the color as a string in either of the following notations:
Notation 	Example 	Example with transparency
Hexadecimal
	#36A2EB 	#36A2EB80
RGB
or RGBA
	rgb(54, 162, 235) 	rgba(54, 162, 235, 0.5)
HSL
or HSLA
	hsl(204, 82%, 57%) 	hsla(204, 82%, 57%, 0.5)

Alternatively, you can pass a CanvasPattern
or CanvasGradient

object instead of a string color to achieve some interesting effects.
Patterns and Gradients

For example, you can fill a dataset with a pattern from an image.

const img = new Image();
img.src = 'https://example.com/my_image.png';
img.onload = () => {
  const ctx = document.getElementById('canvas').getContext('2d');
  const fillPattern = ctx.createPattern(img, 'repeat');

  const chart = new Chart(ctx, {
    data: {
      labels: ['Item 1', 'Item 2', 'Item 3'],
      datasets: [{
        data: [10, 20, 30],
        backgroundColor: fillPattern
      }]
    }
  });
};

 

 
        Copied!
    

Pattern fills can help viewers with vision deficiencies (e.g., color-blindness or partial sight) more easily understand your data

.

You can use the Patternomaly

library to generate patterns to fill datasets:

const chartData = {
  datasets: [{
    data: [45, 25, 20, 10],
    backgroundColor: [
      pattern.draw('square', '#ff6384'),
      pattern.draw('circle', '#36a2eb'),
      pattern.draw('diamond', '#cc65fe'),
      pattern.draw('triangle', '#ffce56')
    ]
  }],
  labels: ['Red', 'Blue', 'Purple', 'Yellow']
};

 

 

 Data structures

The data property of a dataset can be passed in various formats. By default, that data is parsed using the associated chart type and scales.

If the labels property of the main data property is used, it has to contain the same amount of elements as the dataset with the most values. These labels are used to label the index axis (default x axes). The values for the labels have to be provided in an array. The provided labels can be of the type string or number to be rendered correctly. In case you want multiline labels you can provide an array with each line as one entry in the array.
Primitive[]

const cfg = {
  type: 'bar',
  data: {
    datasets: [{
      data: [20, 10],
    }],
    labels: ['a', 'b']
  }
}

 

 
        Copied!
    

When the data is an array of numbers, values from labels array at the same index are used for the index axis (x for vertical, y for horizontal charts).
Object[]

const cfg = {
  type: 'line',
  data: {
    datasets: [{
      data: [{x: 10, y: 20}, {x: 15, y: null}, {x: 20, y: 10}]
    }]
  }
}

 

 
        Copied!
    

const cfg = {
  type: 'line',
  data: {
    datasets: [{
      data: [{x: '2016-12-25', y: 20}, {x: '2016-12-26', y: 10}]
    }]
  }
}

 

 
        Copied!
    

const cfg = {
  type: 'bar',
  data: {
    datasets: [{
      data: [{x: 'Sales', y: 20}, {x: 'Revenue', y: 10}]
    }]
  }
}

 

 
        Copied!
    

This is also the internal format used for parsed data. In this mode, parsing can be disabled by specifying parsing: false at chart options or dataset. If parsing is disabled, data must be sorted and in the formats the associated chart type and scales use internally.

The values provided must be parsable by the associated scales or in the internal format of the associated scales. A common mistake would be to provide integers for the category scale, which uses integers as an internal format, where each integer represents an index in the labels array. null can be used for skipped values.
Object[] using custom properties

const cfg = {
  type: 'bar',
  data: {
    datasets: [{
      data: [{id: 'Sales', nested: {value: 1500}}, {id: 'Purchases', nested: {value: 500}}]
    }]
  },
  options: {
    parsing: {
      xAxisKey: 'id',
      yAxisKey: 'nested.value'
    }
  }
}

 

 
        Copied!
    

When using the pie/doughnut, radar or polarArea chart type, the parsing object should have a key item that points to the value to look at. In this example, the doughnut chart will show two items with values 1500 and 500.

const cfg = {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [{id: 'Sales', nested: {value: 1500}}, {id: 'Purchases', nested: {value: 500}}]
    }]
  },
  options: {
    parsing: {
      key: 'nested.value'
    }
  }
}

 

 
        Copied!
    

If the key contains a dot, it needs to be escaped with a double slash:

const cfg = {
  type: 'line',
  data: {
    datasets: [{
      data: [{'data.key': 'one', 'data.value': 20}, {'data.key': 'two', 'data.value': 30}]
    }]
  },
  options: {
    parsing: {
      xAxisKey: 'data\\.key',
      yAxisKey: 'data\\.value'
    }
  }
}

 

 
        Copied!
    

WARNING

When using object notation in a radar chart, you still need a labels array with labels for the chart to show correctly.
Object

const cfg = {
  type: 'line',
  data: {
    datasets: [{
      data: {
        January: 10,
        February: 20
      }
    }]
  }
}

 

 
        Copied!
    

In this mode, property name is used for index scale and value for value scale. For vertical charts, index scale is x and value scale is y.
Dataset Configuration
Name 	Type 	Description
label 	string 	The label for the dataset which appears in the legend and tooltips.
clip 	number|object 	How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. 0 = clip at chartArea. Clipping can also be configured per side: clip: {left: 5, top: false, right: -2, bottom: 0}
order 	number 	The drawing order of dataset. Also affects order for stacking, tooltip and legend.
stack 	string 	The ID of the group to which this dataset belongs to (when stacked, each group will be a separate stack). Defaults to dataset type.
parsing 	boolean|object 	How to parse the dataset. The parsing can be disabled by specifying parsing: false at chart options or dataset. If parsing is disabled, data must be sorted and in the formats the associated chart type and scales use internally.
hidden 	boolean 	Configure the visibility of the dataset. Using hidden: true will hide the dataset from being rendered in the Chart.
parsing

const data = [{x: 'Jan', net: 100, cogs: 50, gm: 50}, {x: 'Feb', net: 120, cogs: 55, gm: 75}];
const cfg = {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb'],
    datasets: [{
      label: 'Net sales',
      data: data,
      parsing: {
        yAxisKey: 'net'
      }
    }, {
      label: 'Cost of goods sold',
      data: data,
      parsing: {
        yAxisKey: 'cogs'
      }
    }, {
      label: 'Gross margin',
      data: data,
      parsing: {
        yAxisKey: 'gm'
      }
    }]
  },
};

 

 
        Copied!
    

Typescript

When using typescript, if you want to use a data structure that is not the default data structure, you will need to pass it to the type interface when instantiating the data variable.

import {ChartData} from 'chart.js';

const datasets: ChartData <'bar', {key: string, value: number} []> = {
  datasets: [{
    data: [{key: 'Sales', value: 20}, {key: 'Revenue', value: 10}],
    parsing: {
      xAxisKey: 'key',
      yAxisKey: 'value'
    }
  }],
};


Fonts

There are special global settings that can change all the fonts on the chart. These options are in Chart.defaults.font. The global font settings only apply when more specific options are not included in the config.

For example, in this chart, the text will have a font size of 16px except for the labels in the legend.

Chart.defaults.font.size = 16;
let chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    font: {
                        size: 14
                    }
                }
            }
        }
    }
});

 

 
        Copied!
    

Name 	Type 	Default 	Description
family 	string 	"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" 	Default font family for all text, follows CSS font-family options.
size 	number 	12 	Default font size (in px) for text. Does not apply to radialLinear scale point labels.
style 	string 	'normal' 	Default font style. Does not apply to tooltip title or footer. Does not apply to chart title. Follows CSS font-style options (i.e. normal, italic, oblique, initial, inherit).
weight 	normal | bold | lighter | bolder | number 	undefined 	Default font weight (boldness). (see MDN
).
lineHeight 	number|string 	1.2 	Height of an individual line of text (see MDN
).
Missing Fonts

If a font is specified for a chart that does exist on the system, the browser will not apply the font when it is set. If you notice odd fonts appearing in your charts, check that the font you are applying exists on your system. See issue 3318

for more details.
Loading Fonts

If a font is not cached and needs to be loaded, charts that use the font will need to be updated once the font is loaded. This can be accomplished using the Font Loading APIs
. See issue 8020 for more details.

Options
Option resolution

Options are resolved from top to bottom, using a context dependent route.
Chart level options

    options
    overrides[config.type]
    defaults

Dataset level options

dataset.type defaults to config.type, if not specified.

    dataset
    options.datasets[dataset.type]
    options
    overrides[config.type].datasets[dataset.type]
    defaults.datasets[dataset.type]
    defaults

Dataset animation options

    dataset.animation
    options.datasets[dataset.type].animation
    options.animation
    overrides[config.type].datasets[dataset.type].animation
    defaults.datasets[dataset.type].animation
    defaults.animation

Dataset element level options

Each scope is looked up with elementType prefix in the option name first, then without the prefix. For example, radius for point element is looked up using pointRadius and if that does not hit, then radius.

    dataset
    options.datasets[dataset.type]
    options.datasets[dataset.type].elements[elementType]
    options.elements[elementType]
    options
    overrides[config.type].datasets[dataset.type]
    overrides[config.type].datasets[dataset.type].elements[elementType]
    defaults.datasets[dataset.type]
    defaults.datasets[dataset.type].elements[elementType]
    defaults.elements[elementType]
    defaults

Scale options

    options.scales
    overrides[config.type].scales
    defaults.scales
    defaults.scale

Plugin options

A plugin can provide additionalOptionScopes array of paths to additionally look for its options in. For root scope, use empty string: ''. Most core plugins also take options from root scope.

    options.plugins[plugin.id]
    (options.[...plugin.additionalOptionScopes])
    overrides[config.type].plugins[plugin.id]
    defaults.plugins[plugin.id]
    (defaults.[...plugin.additionalOptionScopes])

Scriptable Options

Scriptable options also accept a function which is called for each of the underlying data values and that takes the unique argument context representing contextual information (see option context). A resolver is passed as second parameter, that can be used to access other options in the same context.

Note

The context argument should be validated in the scriptable function, because the function can be invoked in different contexts. The type field is a good candidate for this validation.

Example:

color: function(context) {
    const index = context.dataIndex;
    const value = context.dataset.data[index];
    return value < 0 ? 'red' :  // draw negative values in red
        index % 2 ? 'blue' :    // else, alternate values in blue and green
        'green';
},
borderColor: function(context, options) {
    const color = options.color; // resolve the value of another scriptable option: 'red', 'blue' or 'green'
    return Chart.helpers.color(color).lighten(0.2);
}

 

 
        Copied!
    

Indexable Options

Indexable options also accept an array in which each item corresponds to the element at the same index. Note that if there are less items than data, the items are looped over. In many cases, using a function is more appropriate if supported.

Example:

color: [
    'red',    // color for data at index 0
    'blue',   // color for data at index 1
    'green',  // color for data at index 2
    'black',  // color for data at index 3
    //...
]

 

 
        Copied!
    

Option Context

The option context is used to give contextual information when resolving options and currently only applies to scriptable options. The object is preserved, so it can be used to store and pass information between calls.

There are multiple levels of context objects:

    chart
        dataset
            data
        scale
            tick
            pointLabel (only used in the radial linear scale)
        tooltip

Each level inherits its parent(s) and any contextual information stored in the parent is available through the child.

The context object contains the following properties:
chart

    chart: the associated chart
    type: 'chart'

dataset

In addition to chart

    active: true if an element is active (hovered)
    dataset: dataset at index datasetIndex
    datasetIndex: index of the current dataset
    index: same as datasetIndex
    mode: the update mode
    type: 'dataset'

data

In addition to dataset

    active: true if an element is active (hovered)
    dataIndex: index of the current data
    parsed: the parsed data values for the given dataIndex and datasetIndex
    raw: the raw data values for the given dataIndex and datasetIndex
    element: the element (point, arc, bar, etc.) for this data
    index: same as dataIndex
    type: 'data'

scale

In addition to chart

    scale: the associated scale
    type: 'scale'

tick

In addition to scale

    tick: the associated tick object
    index: tick index
    type: 'tick'

pointLabel

In addition to scale

    label: the associated label value
    index: label index
    type: 'pointLabel'

tooltip

In addition to chart

    tooltip: the tooltip object
    tooltipItems: the items the tooltip is displaying

    Padding

Padding values in Chart options can be supplied in a couple of different formats.
Number

If this value is a number, it is applied to all sides (left, top, right, bottom).

For example, defining a 20px padding to all sides of the chart:

let chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        layout: {
            padding: 20
        }
    }
});

 

 
        Copied!
    

{top, left, bottom, right} object

If this value is an object, the left property defines the left padding. Similarly, the right, top and bottom properties can also be specified. Omitted properties default to 0.

Let's say you wanted to add 50px of padding to the left side of the chart canvas, you would do:

let chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        layout: {
            padding: {
                left: 50
            }
        }
    }
});

 

 
        Copied!
    

{x, y} object

This is a shorthand for defining left/right and top/bottom to the same values.

For example, 10px left / right and 4px top / bottom padding on a Radial Linear Axis tick backdropPadding:

let chart = new Chart(ctx, {
    type: 'radar',
    data: data,
    options: {
        scales: {
          r: {
            ticks: {
              backdropPadding: {
                  x: 10,
                  y: 4
              }
            }
        }
    }
});

 

 
 Performance

Chart.js charts are rendered on canvas elements, which makes rendering quite fast. For large datasets or performance sensitive applications, you may wish to consider the tips below.
Data structure and format
Parsing

Provide prepared data in the internal format accepted by the dataset and scales, and set parsing: false. See Data structures for more information.
Data normalization

Chart.js is fastest if you provide data with indices that are unique, sorted, and consistent across datasets and provide the normalized: true option to let Chart.js know that you have done so. Even without this option, it can sometimes still be faster to provide sorted data.
Decimation

Decimating your data will achieve the best results. When there is a lot of data to display on the graph, it doesn't make sense to show tens of thousands of data points on a graph that is only a few hundred pixels wide.

The decimation plugin can be used with line charts to decimate data before the chart is rendered. This will provide the best performance since it will reduce the memory needed to render the chart.

Line charts are able to do automatic data decimation during draw, when certain conditions are met. You should still consider decimating data yourself before passing it in for maximum performance since the automatic decimation occurs late in the chart life cycle.
Tick Calculation
Rotation

Specify a rotation value by setting minRotation and maxRotation to the same value, which avoids the chart from having to automatically determine a value to use.
Sampling

Set the ticks.sampleSize option. This will determine how large your labels are by looking at only a subset of them in order to render axes more quickly. This works best if there is not a large variance in the size of your labels.
Disable Animations

If your charts have long render times, it is a good idea to disable animations. Doing so will mean that the chart needs to only be rendered once during an update instead of multiple times. This will have the effect of reducing CPU usage and improving general page performance. Line charts use Path2D caching when animations are disabled and Path2D is available.

To disable animations

new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        animation: false
    }
});

 

 
        Copied!
    

Specify min and max for scales

If you specify the min and max, the scale does not have to compute the range from the data.

new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            x: {
                type: 'time',
                min: new Date('2019-01-01').valueOf(),
                max: new Date('2019-12-31').valueOf()
            },
            y: {
                type: 'linear',
                min: 0,
                max: 100
            }
        }
    }
});

 

 
        Copied!
    

Parallel rendering with web workers

As of 2023, modern browser have the ability to transfer rendering control of a canvas
to a web worker. Web workers can use the OffscreenCanvas API

to render from a web worker onto canvases in the DOM. Chart.js is a canvas-based library and supports rendering in a web worker - just pass an OffscreenCanvas into the Chart constructor instead of a Canvas element.

By moving all Chart.js calculations onto a separate thread, the main thread can be freed up for other uses. Some tips and tricks when using Chart.js in a web worker:

    Transferring data between threads can be expensive, so ensure that your config and data objects are as small as possible. Try generating them on the worker side if you can (workers can make HTTP requests!) or passing them to your worker as ArrayBuffers, which can be transferred quickly from one thread to another.
    You can't transfer functions between threads, so if your config object includes functions you'll have to strip them out before transferring and then add them back later.
    You can't access the DOM from worker threads, so Chart.js plugins that use the DOM (including any mouse interactions) will likely not work.
    Ensure that you have a fallback if you support older browsers.
    Resizing the chart must be done manually. See an example in the worker code below.

Example main thread code:

const config = {};
const canvas = new HTMLCanvasElement();
const offscreenCanvas = canvas.transferControlToOffscreen();

const worker = new Worker('worker.js');
worker.postMessage({canvas: offscreenCanvas, config}, [offscreenCanvas]);

 

 
        Copied!
    

Example worker code, in worker.js:

onmessage = function(event) {
    const {canvas, config} = event.data;
    const chart = new Chart(canvas, config);

    // Resizing the chart must be done manually, since OffscreenCanvas does not include event listeners.
    canvas.width = 100;
    canvas.height = 100;
    chart.resize();
};

 

 
        Copied!
    

Line Charts
Leave Bézier curves disabled

If you are drawing lines on your chart, disabling Bézier curves will improve render times since drawing a straight line is more performant than a Bézier curve. Bézier curves are disabled by default.
Automatic data decimation during draw

Line element will automatically decimate data, when tension, stepped, and borderDash are left set to their default values (false, 0, and [] respectively). This improves rendering speed by skipping drawing of invisible line segments.
Enable spanGaps

If you have a lot of data points, it can be more performant to enable spanGaps. This disables segmentation of the line, which can be an unneeded step.

To enable spanGaps:

new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            spanGaps: true // enable for a single dataset
        }]
    },
    options: {
        spanGaps: true // enable for all datasets
    }
});

 

 
        Copied!
    

Disable Line Drawing

If you have a lot of data points, it can be more performant to disable rendering of the line for a dataset and only draw points. Doing this means that there is less to draw on the canvas which will improve render performance.

To disable lines:

new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            showLine: false // disable for a single dataset
        }]
    },
    options: {
        showLine: false // disable for all datasets
    }
});

 

 
        Copied!
    

Disable Point Drawing

If you have a lot of data points, it can be more performant to disable rendering of the points for a dataset and only draw line. Doing this means that there is less to draw on the canvas which will improve render performance.

To disable point drawing:

new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            pointRadius: 0 // disable for a single dataset
        }]
    },
    options: {
        datasets: {
            line: {
                pointRadius: 0 // disable for all `'line'` datasets
            }
        },
        elements: {
            point: {
                radius: 0 // default to disabled in all datasets
            }
        }
    }
});

 

 
        Copied!
    

When transpiling with Babel, consider using loose mode

Babel 7.9 changed the way classes are constructed. It is slow, unless used with loose mode. More information



Configuration

The configuration is used to change how the chart behaves. There are properties to control styling, fonts, the legend, etc.
Configuration object structure

The top level structure of Chart.js configuration:

const config = {
  type: 'line',
  data: {},
  options: {},
  plugins: []
}

 

 
        Copied!
    

type

Chart type determines the main type of the chart.

note A dataset can override the type, this is how mixed charts are constructed.
data

See Data Structures for details.
options

Majority of the documentation talks about these options.
plugins

Inline plugins can be included in this array. It is an alternative way of adding plugins for single chart (vs registering the plugin globally). More about plugins in the developers section.
Global Configuration

This concept was introduced in Chart.js 1.0 to keep configuration DRY

, and allow for changing options globally across chart types, avoiding the need to specify options for each instance, or the default for a particular chart type.

Chart.js merges the options object passed to the chart with the global configuration using chart type defaults and scales defaults appropriately. This way you can be as specific as you would like in your individual chart configuration, while still changing the defaults for all chart types where applicable. The global general options are defined in Chart.defaults. The defaults for each chart type are discussed in the documentation for that chart type.

The following example would set the interaction mode to 'nearest' for all charts where this was not overridden by the chart type defaults or the options passed to the constructor on creation.

Chart.defaults.interaction.mode = 'nearest';

// Interaction mode is set to nearest because it was not overridden here
const chartInteractionModeNearest = new Chart(ctx, {
    type: 'line',
    data: data
});

// This chart would have the interaction mode that was passed in
const chartDifferentInteractionMode = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            // Overrides the global setting
            mode: 'index'
        }
    }
});

 

 
        Copied!
    

Dataset Configuration

Options may be configured directly on the dataset. The dataset options can be changed at multiple different levels. See options for details on how the options are resolved.

The following example would set the showLine option to 'false' for all line datasets except for those overridden by options passed to the dataset on creation.

// Do not show lines for all datasets by default
Chart.defaults.datasets.line.showLine = false;

// This chart would show a line only for the third dataset
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            data: [0, 0],
        }, {
            data: [0, 1]
        }, {
            data: [1, 0],
            showLine: true // overrides the `line` dataset default
        }, {
            type: 'scatter', // 'line' dataset default does not affect this dataset since it's a 'scatter'
            data: [1, 1]
        }]
    }
});

 

 

 Animations

Chart.js animates charts out of the box. A number of options are provided to configure how the animation looks and how long it takes.

    Looping tension [property]
    Hide and show [mode]

const config = {
  type: 'line',
  data: data,
  options: {
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear',
        from: 1,
        to: 0,
        loop: true
      }
    },
    scales: {
      y: { // defining min and max so hiding the dataset does not change scale range
        min: 0,
        max: 100
      }
    }
  }
};

Animation configuration

Animation configuration consists of 3 keys.
Name 	Type 	Details
animation 	object 	animation
animations 	object 	animations
transitions 	object 	transitions

These keys can be configured in following paths:

    `` - chart options
    datasets[type] - dataset type options
    overrides[type] - chart type options

These paths are valid under defaults for global configuration and options for instance configuration.
animation

The default configuration is defined here: core.animations.js

Namespace: options.animation
Name 	Type 	Default 	Description
duration 	number 	1000 	The number of milliseconds an animation takes.
easing 	string 	'easeOutQuart' 	Easing function to use. more...
delay 	number 	undefined 	Delay before starting the animations.
loop 	boolean 	undefined 	If set to true, the animations loop endlessly.

These defaults can be overridden in options.animation or dataset.animation and tooltip.animation. These keys are also Scriptable.
animations

Animations options configures which element properties are animated and how. In addition to the main animation configuration, the following options are available:

Namespace: options.animations[animation]
Name 	Type 	Default 	Description
properties 	string[] 	key 	The property names this configuration applies to. Defaults to the key name of this object.
type 	string 	typeof property 	Type of property, determines the interpolator used. Possible values: 'number', 'color' and 'boolean'. Only really needed for 'color', because typeof does not get that right.
from 	number|Color|boolean 	undefined 	Start value for the animation. Current value is used when undefined
to 	number|Color|boolean 	undefined 	End value for the animation. Updated value is used when undefined
fn 	<T>(from: T, to: T, factor: number) => T; 	undefined 	Optional custom interpolator, instead of using a predefined interpolator from type
Default animations
Name 	Option 	Value
numbers 	properties 	['x', 'y', 'borderWidth', 'radius', 'tension']
numbers 	type 	'number'
colors 	properties 	['color', 'borderColor', 'backgroundColor']
colors 	type 	'color'

Note

These default animations are overridden by most of the dataset controllers.
transitions

The core transitions are 'active', 'hide', 'reset', 'resize', 'show'. A custom transition can be used by passing a custom mode to update. Transition extends the main animation configuration and animations configuration.
Default transitions

Namespace: options.transitions[mode]
Mode 	Option 	Value 	Description
'active' 	animation.duration 	400 	Override default duration to 400ms for hover animations
'resize' 	animation.duration 	0 	Override default duration to 0ms (= no animation) for resize
'show' 	animations.colors 	{ type: 'color', properties: ['borderColor', 'backgroundColor'], from: 'transparent' } 	Colors are faded in from transparent when dataset is shown using legend / api.
'show' 	animations.visible 	{ type: 'boolean', duration: 0 } 	Dataset visibility is immediately changed to true so the color transition from transparent is visible.
'hide' 	animations.colors 	{ type: 'color', properties: ['borderColor', 'backgroundColor'], to: 'transparent' } 	Colors are faded to transparent when dataset id hidden using legend / api.
'hide' 	animations.visible 	{ type: 'boolean', easing: 'easeInExpo' } 	Visibility is changed to false at a very late phase of animation
Disabling animation

To disable an animation configuration, the animation node must be set to false, with the exception for animation modes which can be disabled by setting the duration to 0.

chart.options.animation = false; // disables all animations
chart.options.animations.colors = false; // disables animation defined by the collection of 'colors' properties
chart.options.animations.x = false; // disables animation defined by the 'x' property
chart.options.transitions.active.animation.duration = 0; // disables the animation for 'active' mode

 

 
        Copied!
    

Easing

Available options are:

    'linear'
    'easeInQuad'
    'easeOutQuad'
    'easeInOutQuad'
    'easeInCubic'
    'easeOutCubic'
    'easeInOutCubic'
    'easeInQuart'
    'easeOutQuart'
    'easeInOutQuart'
    'easeInQuint'
    'easeOutQuint'
    'easeInOutQuint'
    'easeInSine'
    'easeOutSine'
    'easeInOutSine'
    'easeInExpo'
    'easeOutExpo'
    'easeInOutExpo'
    'easeInCirc'
    'easeOutCirc'
    'easeInOutCirc'
    'easeInElastic'
    'easeOutElastic'
    'easeInOutElastic'
    'easeInBack'
    'easeOutBack'
    'easeInOutBack'
    'easeInBounce'
    'easeOutBounce'
    'easeInOutBounce'

See Robert Penner's easing equations

.
Animation Callbacks

The animation configuration provides callbacks which are useful for synchronizing an external draw to the chart animation. The callbacks can be set only at main animation configuration.

Namespace: options.animation
Name 	Type 	Default 	Description
onProgress 	function 	null 	Callback called on each step of an animation.
onComplete 	function 	null 	Callback called when all animations are completed.

The callback is passed the following object:

{
  // Chart object
  chart: Chart,

  // Number of animations still in progress
  currentStep: number,

  // `true` for the initial animation of the chart
  initial: boolean,

  // Total number of animations at the start of current animation
  numSteps: number,
}

 

 
        Copied!
    

The following example fills a progress bar during the chart animation.

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        animation: {
            onProgress: function(animation) {
                progress.value = animation.currentStep / animation.numSteps;
            }
        }
    }
});

 

 Canvas background

In some use cases you would want a background image or color over the whole canvas. There is no built-in support for this, the way you can achieve this is by writing a custom plugin.

In the two example plugins underneath here you can see how you can draw a color or image to the canvas as background. This way of giving the chart a background is only necessary if you want to export the chart with that specific background. For normal use you can set the background more easily with CSS

.

    Color
    Image

const config = {
  type: 'doughnut',
  data: data,
  options: {
    plugins: {
      customCanvasBackgroundColor: {
        color: 'lightGreen',
      }
    }
  },
  plugins: [plugin],
};

Data Decimation

The decimation plugin can be used with line charts to automatically decimate data at the start of the chart lifecycle. Before enabling this plugin, review the requirements to ensure that it will work with the chart you want to create.
Configuration Options

Namespace: options.plugins.decimation, the global options for the plugin are defined in Chart.defaults.plugins.decimation.
Name 	Type 	Default 	Description
enabled 	boolean 	false 	Is decimation enabled?
algorithm 	string 	'min-max' 	Decimation algorithm to use. See the more...
samples 	number 		If the 'lttb' algorithm is used, this is the number of samples in the output dataset. Defaults to the canvas width to pick 1 sample per pixel.
threshold 	number 		If the number of samples in the current axis range is above this value, the decimation will be triggered. Defaults to 4 times the canvas width.
The number of point after decimation can be higher than the threshold value.
Decimation Algorithms

Decimation algorithm to use for data. Options are:

    'lttb'
    'min-max'

Largest Triangle Three Bucket (LTTB) Decimation

LTTB

decimation reduces the number of data points significantly. This is most useful for showing trends in data using only a few data points.
Min/Max Decimation

Min/max

decimation will preserve peaks in your data but could require up to 4 points for each pixel. This type of decimation would work well for a very noisy signal where you need to see data peaks.
Requirements

To use the decimation plugin, the following requirements must be met:

    The dataset must have an indexAxis of 'x'
    The dataset must be a line
    The X axis for the dataset must be either a 'linear' or 'time' type axis
    Data must not need parsing, i.e. parsing must be false
    The dataset object must be mutable. The plugin stores the original data as dataset._data and then defines a new data property on the dataset.
    There must be more points on the chart than the threshold value. Take a look at the Configuration Options for more information.

Related Samples

    Data Decimation Sample

Device Pixel Ratio

By default, the chart's canvas will use a 1:1 pixel ratio, unless the physical display has a higher pixel ratio (e.g. Retina displays).

For applications where a chart will be converted to a bitmap, or printed to a higher DPI medium, it can be desirable to render the chart at a higher resolution than the default.

Setting devicePixelRatio to a value other than 1 will force the canvas size to be scaled by that amount, relative to the container size. There should be no visible difference on screen; the difference will only be visible when the image is zoomed or printed.
Configuration Options

Namespace: options
Name 	Type 	Default 	Description
devicePixelRatio 	number 	window.devicePixelRatio 	Override the window's default devicePixelRatio.
Last Updated: 12/1/2024, 4:35:13 PM


Elements

While chart types provide settings to configure the styling of each dataset, you sometimes want to style all datasets the same way. A common example would be to stroke all the bars in a bar chart with the same colour but change the fill per dataset. Options can be configured for four different types of elements: arc, lines, points, and bars. When set, these options apply to all objects of that type unless specifically overridden by the configuration attached to a dataset.
Global Configuration

The element options can be specified per chart or globally. The global options for elements are defined in Chart.defaults.elements. For example, to set the border width of all bar charts globally, you would do:

Chart.defaults.elements.bar.borderWidth = 2;

 

 
        Copied!
    

Point Configuration

Point elements are used to represent the points in a line, radar or bubble chart.

Namespace: options.elements.point, global point options: Chart.defaults.elements.point.
Name 	Type 	Default 	Description
radius 	number 	3 	Point radius.
pointStyle
	
pointStyle
	'circle' 	Point style.
rotation 	number 	0 	Point rotation (in degrees).
backgroundColor 	
Color
	Chart.defaults.backgroundColor 	Point fill color.
borderWidth 	number 	1 	Point stroke width.
borderColor 	
Color
	'Chart.defaults.borderColor 	Point stroke color.
hitRadius 	number 	1 	Extra radius added to point radius for hit detection.
hoverRadius 	number 	4 	Point radius when hovered.
hoverBorderWidth 	number 	1 	Stroke width when hovered.
Point Styles
Types

The pointStyle argument accepts the following type of inputs: string, Image and HTMLCanvasElement
Info

When a string is provided, the following values are supported:

    'circle'
    'cross'
    'crossRot'
    'dash'
    'line'
    'rect'
    'rectRounded'
    'rectRot'
    'star'
    'triangle'
    false

If the value is an image or a canvas element, that image or canvas element is drawn on the canvas using drawImage

.
Line Configuration

Line elements are used to represent the line in a line chart.

Namespace: options.elements.line, global line options: Chart.defaults.elements.line.
Name 	Type 	Default 	Description
tension 	number 	0 	Bézier curve tension (0 for no Bézier curves).
backgroundColor 	
Color
	Chart.defaults.backgroundColor 	Line fill color.
borderWidth 	number 	3 	Line stroke width.
borderColor 	
Color
	Chart.defaults.borderColor 	Line stroke color.
borderCapStyle 	string 	'butt' 	Line cap style. See MDN
.
borderDash 	number[] 	[] 	Line dash. See MDN
.
borderDashOffset 	number 	0.0 	Line dash offset. See MDN
.
borderJoinStyle 	'round'|'bevel'|'miter' 	'miter' 	Line join style. See MDN
.
capBezierPoints 	boolean 	true 	true to keep Bézier control inside the chart, false for no restriction.
cubicInterpolationMode 	string 	'default' 	Interpolation mode to apply. See more...
fill 	boolean|string 	false 	How to fill the area under the line. See area charts.
stepped 	boolean 	false 	true to show the line as a stepped line (tension will be ignored).
Bar Configuration

Bar elements are used to represent the bars in a bar chart.

Namespace: options.elements.bar, global bar options: Chart.defaults.elements.bar.
Name 	Type 	Default 	Description
backgroundColor 	
Color
	Chart.defaults.backgroundColor 	Bar fill color.
borderWidth 	number 	0 	Bar stroke width.
borderColor 	
Color
	Chart.defaults.borderColor 	Bar stroke color.
borderSkipped 	string 	'start' 	Skipped (excluded) border: 'start', 'end', 'middle', 'bottom', 'left', 'top', 'right' or false.
borderRadius 	number|object 	0 	The bar border radius (in pixels).
inflateAmount 	number|'auto' 	'auto' 	The amount of pixels to inflate the bar rectangle(s) when drawing.
pointStyle
	string|Image|HTMLCanvasElement 	'circle' 	Style of the point for legend.
Arc Configuration

Arcs are used in the polar area, doughnut and pie charts.

Namespace: options.elements.arc, global arc options: Chart.defaults.elements.arc.
Name 	Type 	Default 	Description
angle - for polar only 	number 	circumference / (arc count) 	Arc angle to cover.
backgroundColor 	
Color
	Chart.defaults.backgroundColor 	Arc fill color.
borderAlign 	'center'|'inner' 	'center' 	Arc stroke alignment.
borderColor 	
Color
	'#fff' 	Arc stroke color.
borderDash 	number[] 	[] 	Arc line dash. See MDN
.
borderDashOffset 	number 	0.0 	Arc line dash offset. See MDN
.
borderJoinStyle 	'round'|'bevel'|'miter' 	'bevel'|'round' 	Line join style. See MDN
. The default is 'round' when borderAlign is 'inner'
borderWidth 	number 	2 	Arc stroke width.
circular 	boolean 	true 	By default the Arc is curved. If circular: false the Arc will be flat

Interactions

Namespace: options.interaction, the global interaction configuration is at Chart.defaults.interaction. To configure which events trigger chart interactions, see events.
Name 	Type 	Default 	Description
mode 	string 	'nearest' 	Sets which elements appear in the interaction. See Interaction Modes for details.
intersect 	boolean 	true 	if true, the interaction mode only applies when the mouse position intersects an item on the chart.
axis 	string 	'x' 	Can be set to 'x', 'y', 'xy' or 'r' to define which directions are used in calculating distances. Defaults to 'x' for 'index' mode and 'xy' in dataset and 'nearest' modes.
includeInvisible 	boolean 	false 	if true, the invisible points that are outside of the chart area will also be included when evaluating interactions.

By default, these options apply to both the hover and tooltip interactions. The same options can be set in the options.hover namespace, in which case they will only affect the hover interaction. Similarly, the options can be set in the options.plugins.tooltip namespace to independently configure the tooltip interactions.
Events

The following properties define how the chart interacts with events. Namespace: options
Name 	Type 	Default 	Description
events 	string[] 	['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'] 	The events option defines the browser events that the chart should listen to for. Each of these events trigger hover and are passed to plugins. more...
onHover 	function 	null 	Called when any of the events fire over chartArea. Passed the event, an array of active elements (bars, points, etc), and the chart.
onClick 	function 	null 	Called if the event is of type 'mouseup', 'click' or ''contextmenu' over chartArea. Passed the event, an array of active elements, and the chart.
Event Option

For example, to have the chart only respond to click events, you could do:

const chart = new Chart(ctx, {
  type: 'line',
  data: data,
  options: {
    // This chart will not respond to mousemove, etc
    events: ['click']
  }
});

 

 
        Copied!
    

Events for each plugin can be further limited by defining (allowed) events array in plugin options:

const chart = new Chart(ctx, {
  type: 'line',
  data: data,
  options: {
    // All of these (default) events trigger a hover and are passed to all plugins,
    // unless limited at plugin options
    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
    plugins: {
      tooltip: {
        // Tooltip will only receive click events
        events: ['click']
      }
    }
  }
});

 

 
        Copied!
    

Events that do not fire over chartArea, like mouseout, can be captured using a simple plugin:

const chart = new Chart(ctx, {
  type: 'line',
  data: data,
  options: {
    // these are the default events:
    // events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
  },
  plugins: [{
    id: 'myEventCatcher',
    beforeEvent(chart, args, pluginOptions) {
      const event = args.event;
      if (event.type === 'mouseout') {
        // process the event
      }
    }
  }]
});

 

 
        Copied!
    

For more information about plugins, see Plugins
Converting Events to Data Values

A common occurrence is taking an event, such as a click, and finding the data coordinates on the chart where the event occurred. Chart.js provides helpers that make this a straightforward process.

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        onClick: (e) => {
            const canvasPosition = Chart.helpers.getRelativePosition(e, chart);

            // Substitute the appropriate scale IDs
            const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
            const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
        }
    }
});

 

 
        Copied!
    

When using a bundler, the helper functions have to be imported separately, for a full explanation of this please head over to the integration page
Modes

When configuring the interaction with the graph via interaction, hover or tooltips, a number of different modes are available.

options.hover and options.plugins.tooltip extend from options.interaction. So if mode, intersect or any other common settings are configured only in options.interaction, both hover and tooltips obey that.

The modes are detailed below and how they behave in conjunction with the intersect setting.

See how different modes work with the tooltip in tooltip interactions sample
point

Finds all of the items that intersect the point.

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            mode: 'point'
        }
    }
});

 

 
        Copied!
    

nearest

Gets the items that are at the nearest distance to the point. The nearest item is determined based on the distance to the center of the chart item (point, bar). You can use the axis setting to define which coordinates are considered in distance calculation. If intersect is true, this is only triggered when the mouse position intersects an item in the graph. This is very useful for combo charts where points are hidden behind bars.

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            mode: 'nearest'
        }
    }
});

 

 
        Copied!
    

index

Finds item at the same index. If the intersect setting is true, the first intersecting item is used to determine the index in the data. If intersect false the nearest item, in the x direction, is used to determine the index.

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            mode: 'index'
        }
    }
});

 

 
        Copied!
    

To use index mode in a chart like the horizontal bar chart, where we search along the y direction, you can use the axis setting introduced in v2.7.0. By setting this value to 'y' on the y direction is used.

const chart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
        interaction: {
            mode: 'index',
            axis: 'y'
        }
    }
});

 

 
        Copied!
    

dataset

Finds items in the same dataset. If the intersect setting is true, the first intersecting item is used to determine the index in the data. If intersect false the nearest item is used to determine the index.

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            mode: 'dataset'
        }
    }
});

 

 
        Copied!
    

x

Returns all items that would intersect based on the X coordinate of the position only. Would be useful for a vertical cursor implementation. Note that this only applies to cartesian charts.

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            mode: 'x'
        }
    }
});

 

 
        Copied!
    

y

Returns all items that would intersect based on the Y coordinate of the position. This would be useful for a horizontal cursor implementation. Note that this only applies to cartesian charts.

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            mode: 'y'
        }
    }
});

 

 
        Copied!
    

Custom Interaction Modes

New modes can be defined by adding functions to the Chart.Interaction.modes map. You can use the Chart.Interaction.evaluateInteractionItems function to help implement these.

Example:

import { Interaction } from 'chart.js';
import { getRelativePosition } from 'chart.js/helpers';

/**
 * Custom interaction mode
 * @function Interaction.modes.myCustomMode
 * @param {Chart} chart - the chart we are returning items from
 * @param {Event} e - the event we are find things at
 * @param {InteractionOptions} options - options to use
 * @param {boolean} [useFinalPosition] - use final element position (animation target)
 * @return {InteractionItem[]} - items that are found
 */
Interaction.modes.myCustomMode = function(chart, e, options, useFinalPosition) {
  const position = getRelativePosition(e, chart);

  const items = [];
  Interaction.evaluateInteractionItems(chart, 'x', position, (element, datasetIndex, index) => {
    if (element.inXRange(position.x, useFinalPosition) && myCustomLogic(element)) {
      items.push({element, datasetIndex, index});
    }
  });
  return items;
};

// Then, to use it...
new Chart.js(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            mode: 'myCustomMode'
        }
    }
})

 

 
        Copied!
    

If you're using TypeScript, you'll also need to register the new mode:

declare module 'chart.js' {
  interface InteractionModeMap {
    myCustomMode: InteractionModeFunction;
  }
}

 

 

 Layout

Namespace: options.layout, the global options for the chart layout is defined in Chart.defaults.layout.
Name 	Type 	Default 	Scriptable 	Description
autoPadding 	boolean 	true 	No 	Apply automatic padding so visible elements are completely drawn.
padding 	
Padding
	0 	Yes 	The padding to add inside the chart.

Legend

The chart legend displays data about the datasets that are appearing on the chart.
Configuration options

Namespace: options.plugins.legend, the global options for the chart legend is defined in Chart.defaults.plugins.legend.

WARNING

The doughnut, pie, and polar area charts override the legend defaults. To change the overrides for those chart types, the options are defined in Chart.overrides[type].plugins.legend.
Name 	Type 	Default 	Description
display 	boolean 	true 	Is the legend shown?
position 	string 	'top' 	Position of the legend. more...
align 	string 	'center' 	Alignment of the legend. more...
maxHeight 	number 		Maximum height of the legend, in pixels
maxWidth 	number 		Maximum width of the legend, in pixels
fullSize 	boolean 	true 	Marks that this box should take the full width/height of the canvas (moving other boxes). This is unlikely to need to be changed in day-to-day use.
onClick 	function 		A callback that is called when a click event is registered on a label item. Arguments: [event, legendItem, legend].
onHover 	function 		A callback that is called when a 'mousemove' event is registered on top of a label item. Arguments: [event, legendItem, legend].
onLeave 	function 		A callback that is called when a 'mousemove' event is registered outside of a previously hovered label item. Arguments: [event, legendItem, legend].
reverse 	boolean 	false 	Legend will show datasets in reverse order.
labels 	object 		See the Legend Label Configuration section below.
rtl 	boolean 		true for rendering the legends from right to left.
textDirection 	string 	canvas' default 	This will force the text direction 'rtl' or 'ltr' on the canvas for rendering the legend, regardless of the css specified on the canvas
title 	object 		See the Legend Title Configuration section below.

Note

If you need more visual customizations, please use an HTML legend.
Position

Position of the legend. Options are:

    'top'
    'left'
    'bottom'
    'right'
    'chartArea'

When using the 'chartArea' option the legend position is at the moment not configurable, it will always be on the left side of the chart in the middle.
Align

Alignment of the legend. Options are:

    'start'
    'center'
    'end'

Defaults to 'center' for unrecognized values.
Legend Label Configuration

Namespace: options.plugins.legend.labels
Name 	Type 	Default 	Description
boxWidth 	number 	40 	Width of coloured box.
boxHeight 	number 	font.size 	Height of the coloured box.
color 	
Color
	Chart.defaults.color 	Color of label and the strikethrough.
font 	Font 	Chart.defaults.font 	See Fonts
padding 	number 	10 	Padding between rows of colored boxes.
generateLabels 	function 		Generates legend items for each thing in the legend. Default implementation returns the text + styling for the color box. See Legend Item for details.
filter 	function 	null 	Filters legend items out of the legend. Receives 2 parameters, a Legend Item and the chart data.
sort 	function 	null 	Sorts legend items. Type is : sort(a: LegendItem, b: LegendItem, data: ChartData): number;. Receives 3 parameters, two Legend Items and the chart data. The return value of the function is a number that indicates the order of the two legend item parameters. The ordering matches the return value
of Array.prototype.sort()
pointStyle
	
pointStyle
	'circle' 	If specified, this style of point is used for the legend. Only used if usePointStyle is true.
textAlign 	string 	'center' 	Horizontal alignment of the label text. Options are: 'left', 'right' or 'center'.
usePointStyle 	boolean 	false 	Label style will match corresponding point style (size is based on pointStyleWidth or the minimum value between boxWidth and font.size).
pointStyleWidth 	number 	null 	If usePointStyle is true, the width of the point style used for the legend.
useBorderRadius 	boolean 	false 	Label borderRadius will match corresponding borderRadius.
borderRadius 	number 	undefined 	Override the borderRadius to use.
Legend Title Configuration

Namespace: options.plugins.legend.title
Name 	Type 	Default 	Description
color 	
Color
	Chart.defaults.color 	Color of text.
display 	boolean 	false 	Is the legend title displayed.
font 	Font 	Chart.defaults.font 	See Fonts
padding 	
Padding
	0 	Padding around the title.
text 	string 		The string title.
Legend Item Interface

Items passed to the legend onClick function are the ones returned from labels.generateLabels. These items must implement the following interface.

{
    // Label that will be displayed
    text: string,

    // Border radius of the legend item.
    // Introduced in 3.1.0
    borderRadius?: number | BorderRadius,

    // Index of the associated dataset
    datasetIndex: number,

    // Fill style of the legend box
    fillStyle: Color,

    // Text color
    fontColor: Color,

    // If true, this item represents a hidden dataset. Label will be rendered with a strike-through effect
    hidden: boolean,

    // For box border. See https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap
    lineCap: string,

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
    lineDash: number[],

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
    lineDashOffset: number,

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
    lineJoin: string,

    // Width of box border
    lineWidth: number,

    // Stroke style of the legend box
    strokeStyle: Color,

    // Point style of the legend box (only used if usePointStyle is true)
    pointStyle: string | Image | HTMLCanvasElement,

    // Rotation of the point in degrees (only used if usePointStyle is true)
    rotation: number
}

 

 
        Copied!
    

Example

The following example will create a chart with the legend enabled and turn all the text red in color.

const chart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: 'rgb(255, 99, 132)'
                }
            }
        }
    }
});

 

 
        Copied!
    

Custom On Click Actions

It can be common to want to trigger different behaviour when clicking an item in the legend. This can be easily achieved using a callback in the config object.

The default legend click handler is:

function(e, legendItem, legend) {
    const index = legendItem.datasetIndex;
    const ci = legend.chart;
    if (ci.isDatasetVisible(index)) {
        ci.hide(index);
        legendItem.hidden = true;
    } else {
        ci.show(index);
        legendItem.hidden = false;
    }
}

 

 
        Copied!
    

Let's say we wanted instead to link the display of the first two datasets. We could change the click handler accordingly.

const defaultLegendClickHandler = Chart.defaults.plugins.legend.onClick;
const pieDoughnutLegendClickHandler = Chart.controllers.doughnut.overrides.plugins.legend.onClick;
const newLegendClickHandler = function (e, legendItem, legend) {
    const index = legendItem.datasetIndex;
    const type = legend.chart.config.type;

    if (index > 1) {
        // Do the original logic
        if (type === 'pie' || type === 'doughnut') {
            pieDoughnutLegendClickHandler(e, legendItem, legend)
        } else {
            defaultLegendClickHandler(e, legendItem, legend);
        }

    } else {
        let ci = legend.chart;
        [
            ci.getDatasetMeta(0),
            ci.getDatasetMeta(1)
        ].forEach(function(meta) {
            meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
        });
        ci.update();
    }
};

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            legend: {
                onClick: newLegendClickHandler
            }
        }
    }
});

 

 
        Copied!
    

Now when you click the legend in this chart, the visibility of the first two datasets will be linked together.

Locale

For applications where the numbers of ticks on scales must be formatted accordingly with a language sensitive number formatting, you can enable this kind of formatting by setting the locale option.

The locale is a string that is a Unicode BCP 47 locale identifier

.

A Unicode BCP 47 locale identifier consists of

    a language code,
    (optionally) a script code,
    (optionally) a region (or country) code,
    (optionally) one or more variant codes, and
    (optionally) one or more extension sequences,

with all present components separated by hyphens.

By default, the chart is using the default locale of the platform which is running on.
Configuration Options

Namespace: options
Name 	Type 	Default 	Description
locale 	string 	undefined 	a string with a BCP 47 language tag, leveraging on INTL NumberFormat
.

Responsive Charts

When it comes to changing the chart size based on the window size, a major limitation is that the canvas render size (canvas.width and .height) can not be expressed with relative values, contrary to the display size (canvas.style.width and .height). Furthermore, these sizes are independent of each other and thus the canvas render size does not adjust automatically based on the display size, making the rendering inaccurate.

The following examples do not work:

    <canvas height="40vh" width="80vw">: invalid values, the canvas doesn't resize (example

)
<canvas style="height:40vh; width:80vw">: invalid behavior, the canvas is resized but becomes blurry (example

    )
    <canvas style="margin: 0 auto;">: invalid behavior, the canvas continually shrinks. Chart.js needs a dedicated container for each canvas and this styling should be applied there.

Chart.js provides a few options to enable responsiveness and control the resize behavior of charts by detecting when the canvas display size changes and update the render size accordingly.
Configuration Options

Namespace: options
Name 	Type 	Default 	Description
responsive 	boolean 	true 	Resizes the chart canvas when its container does (important note...).
maintainAspectRatio 	boolean 	true 	Maintain the original canvas aspect ratio (width / height) when resizing.
aspectRatio 	number 	1|2 	Canvas aspect ratio (i.e. width / height, a value of 1 representing a square canvas). Note that this option is ignored if the height is explicitly defined either as attribute or via the style. The default value varies by chart type; Radial charts (doughnut, pie, polarArea, radar) default to 1 and others default to 2.
onResize 	function 	null 	Called when a resize occurs. Gets passed two arguments: the chart instance and the new size.
resizeDelay 	number 	0 	Delay the resize update by the given amount of milliseconds. This can ease the resize process by debouncing the update of the elements.
Important Note

Detecting when the canvas size changes can not be done directly from the canvas element. Chart.js uses its parent container to update the canvas render and display sizes. However, this method requires the container to be relatively positioned and dedicated to the chart canvas only. Responsiveness can then be achieved by setting relative values for the container size (example

):

<div class="chart-container" style="position: relative; height:40vh; width:80vw">
    <canvas id="chart"></canvas>
</div>

 

 
        Copied!
    

The chart can also be programmatically resized by modifying the container size:

chart.canvas.parentNode.style.height = '128px';
chart.canvas.parentNode.style.width = '128px';

 

 
        Copied!
    

Note that in order for the above code to correctly resize the chart height, the maintainAspectRatio option must also be set to false.
Printing Resizable Charts

CSS media queries allow changing styles when printing a page. The CSS applied from these media queries may cause charts to need to resize. However, the resize won't happen automatically. To support resizing charts when printing, you need to hook the onbeforeprint

event and manually trigger resizing of each chart.

function beforePrintHandler () {
    for (let id in Chart.instances) {
        Chart.instances[id].resize();
    }
}

 

 
        Copied!
    

You may also find that, due to complexities in when the browser lays out the document for printing and when resize events are fired, Chart.js is unable to properly resize for the print layout. To work around this, you can pass an explicit size to .resize() then use an onafterprint

event to restore the automatic size when done.

window.addEventListener('beforeprint', () => {
  myChart.resize(600, 600);
});
window.addEventListener('afterprint', () => {
  myChart.resize();
});

 

 
        Copied!
    



Subtitle

Subtitle is a second title placed under the main title, by default. It has exactly the same configuration options with the main title.
Subtitle Configuration

Namespace: options.plugins.subtitle. The global defaults for subtitle are configured in Chart.defaults.plugins.subtitle.

Exactly the same configuration options with title are available for subtitle, the namespaces only differ.
Example Usage

The example below would enable a title of 'Custom Chart Subtitle' on the chart that is created.

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            subtitle: {
                display: true,
                text: 'Custom Chart Subtitle'
            }
        }
    }
});

 

 

 Title

The chart title defines text to draw at the top of the chart.
Title Configuration

Namespace: options.plugins.title, the global options for the chart title is defined in Chart.defaults.plugins.title.
Name 	Type 	Default 	Scriptable 	Description
align 	string 	'center' 	Yes 	Alignment of the title. more...
color 	
Color
	Chart.defaults.color 	Yes 	Color of text.
display 	boolean 	false 	Yes 	Is the title shown?
fullSize 	boolean 	true 	Yes 	Marks that this box should take the full width/height of the canvas. If false, the box is sized and placed above/beside the chart area.
position 	string 	'top' 	Yes 	Position of title. more...
font 	Font 	{weight: 'bold'} 	Yes 	See Fonts
padding 	
Padding
	10 	Yes 	Padding to apply around the title. Only top and bottom are implemented.
text 	string|string[] 	'' 	Yes 	Title text to display. If specified as an array, text is rendered on multiple lines.

Note

If you need more visual customizations, you can implement the title with HTML and CSS.
Position

Possible title position values are:

    'top'
    'left'
    'bottom'
    'right'

Align

Alignment of the title. Options are:

    'start'
    'center'
    'end'

Example Usage

The example below would enable a title of 'Custom Chart Title' on the chart that is created.

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Custom Chart Title'
            }
        }
    }
});

 

 
        Copied!
    

This example shows how to specify separate top and bottom title text padding:

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Custom Chart Title',
                padding: {
                    top: 10,
                    bottom: 30
                }
            }
        }
    }
});

 

 
 Tooltip
Tooltip Configuration

Namespace: options.plugins.tooltip, the global options for the chart tooltips is defined in Chart.defaults.plugins.tooltip.

WARNING

The titleFont, bodyFont and footerFont options default to the Chart.defaults.font options. To change the overrides for those options, you will need to pass a function that returns a font object. See section about overriding default fonts for extra information below.
Name 	Type 	Default 	Description
enabled 	boolean 	true 	Are on-canvas tooltips enabled?
external 	function 	null 	See external tooltip section.
mode 	string 	interaction.mode 	Sets which elements appear in the tooltip. more....
intersect 	boolean 	interaction.intersect 	If true, the tooltip mode applies only when the mouse position intersects with an element. If false, the mode will be applied at all times.
position 	string 	'average' 	The mode for positioning the tooltip. more...
callbacks 	object 		See the callbacks section.
itemSort 	function 		Sort tooltip items. more...
filter 	function 		Filter tooltip items. more...
backgroundColor 	
Color
	'rgba(0, 0, 0, 0.8)' 	Background color of the tooltip.
titleColor 	
Color
	'#fff' 	Color of title text.
titleFont 	Font 	{weight: 'bold'} 	See Fonts.
titleAlign 	string 	'left' 	Horizontal alignment of the title text lines. more...
titleSpacing 	number 	2 	Spacing to add to top and bottom of each title line.
titleMarginBottom 	number 	6 	Margin to add on bottom of title section.
bodyColor 	
Color
	'#fff' 	Color of body text.
bodyFont 	Font 	{} 	See Fonts.
bodyAlign 	string 	'left' 	Horizontal alignment of the body text lines. more...
bodySpacing 	number 	2 	Spacing to add to top and bottom of each tooltip item.
footerColor 	
Color
	'#fff' 	Color of footer text.
footerFont 	Font 	{weight: 'bold'} 	See Fonts.
footerAlign 	string 	'left' 	Horizontal alignment of the footer text lines. more...
footerSpacing 	number 	2 	Spacing to add to top and bottom of each footer line.
footerMarginTop 	number 	6 	Margin to add before drawing the footer.
padding 	
Padding
	6 	Padding inside the tooltip.
caretPadding 	number 	2 	Extra distance to move the end of the tooltip arrow away from the tooltip point.
caretSize 	number 	5 	Size, in px, of the tooltip arrow.
cornerRadius 	number|object 	6 	Radius of tooltip corner curves.
multiKeyBackground 	
Color
	'#fff' 	Color to draw behind the colored boxes when multiple items are in the tooltip.
displayColors 	boolean 	true 	If true, color boxes are shown in the tooltip.
boxWidth 	number 	bodyFont.size 	Width of the color box if displayColors is true.
boxHeight 	number 	bodyFont.size 	Height of the color box if displayColors is true.
boxPadding 	number 	1 	Padding between the color box and the text.
usePointStyle 	boolean 	false 	Use the corresponding point style (from dataset options) instead of color boxes, ex: star, triangle etc. (size is based on the minimum value between boxWidth and boxHeight).
borderColor 	
Color
	'rgba(0, 0, 0, 0)' 	Color of the border.
borderWidth 	number 	0 	Size of the border.
rtl 	boolean 		true for rendering the tooltip from right to left.
textDirection 	string 	canvas' default 	This will force the text direction 'rtl' or 'ltr' on the canvas for rendering the tooltips, regardless of the css specified on the canvas
xAlign 	string 	undefined 	Position of the tooltip caret in the X direction. more
yAlign 	string 	undefined 	Position of the tooltip caret in the Y direction. more

Note

If you need more visual customizations, please use an HTML tooltip.
Position Modes

Possible modes are:

    'average'
    'nearest'

'average' mode will place the tooltip at the average position of the items displayed in the tooltip. 'nearest' will place the tooltip at the position of the element closest to the event position.

You can also define custom position modes.
Tooltip Alignment

The xAlign and yAlign options define the position of the tooltip caret. If these parameters are unset, the optimal caret position is determined.

The following values for the xAlign setting are supported.

    'left'
    'center'
    'right'

The following values for the yAlign setting are supported.

    'top'
    'center'
    'bottom'

Text Alignment

The titleAlign, bodyAlign and footerAlign options define the horizontal position of the text lines with respect to the tooltip box. The following values are supported.

    'left' (default)
    'right'
    'center'

These options are only applied to text lines. Color boxes are always aligned to the left edge.
Sort Callback

Allows sorting of tooltip items. Must implement at minimum a function that can be passed to Array.prototype.sort

. This function can also accept a third parameter that is the data object passed to the chart.
Filter Callback

Allows filtering of tooltip items. Must implement at minimum a function that can be passed to Array.prototype.filter

. This function can also accept a fourth parameter that is the data object passed to the chart.
Tooltip Callbacks

Namespace: options.plugins.tooltip.callbacks, the tooltip has the following callbacks for providing text. For all functions, this will be the tooltip object created from the Tooltip constructor. If the callback returns undefined, then the default callback will be used. To remove things from the tooltip callback should return an empty string.

Namespace: data.datasets[].tooltip.callbacks, items marked with Yes in the column Dataset override can be overridden per dataset.

A tooltip item context is generated for each item that appears in the tooltip. This is the primary model that the callback methods interact with. For functions that return text, arrays of strings are treated as multiple lines of text.
Name 	Arguments 	Return Type 	Dataset override 	Description
beforeTitle 	TooltipItem[] 	string | string[] | undefined 		Returns the text to render before the title.
title 	TooltipItem[] 	string | string[] | undefined 		Returns text to render as the title of the tooltip.
afterTitle 	TooltipItem[] 	string | string[] | undefined 		Returns text to render after the title.
beforeBody 	TooltipItem[] 	string | string[] | undefined 		Returns text to render before the body section.
beforeLabel 	TooltipItem 	string | string[] | undefined 	Yes 	Returns text to render before an individual label. This will be called for each item in the tooltip.
label 	TooltipItem 	string | string[] | undefined 	Yes 	Returns text to render for an individual item in the tooltip. more...
labelColor 	TooltipItem 	object | undefined 	Yes 	Returns the colors to render for the tooltip item. more...
labelTextColor 	TooltipItem 	Color | undefined 	Yes 	Returns the colors for the text of the label for the tooltip item.
labelPointStyle 	TooltipItem 	object | undefined 	Yes 	Returns the point style to use instead of color boxes if usePointStyle is true (object with values pointStyle and rotation). Default implementation uses the point style from the dataset points. more...
afterLabel 	TooltipItem 	string | string[] | undefined 	Yes 	Returns text to render after an individual label.
afterBody 	TooltipItem[] 	string | string[] | undefined 		Returns text to render after the body section.
beforeFooter 	TooltipItem[] 	string | string[] | undefined 		Returns text to render before the footer section.
footer 	TooltipItem[] 	string | string[] | undefined 		Returns text to render as the footer of the tooltip.
afterFooter 	TooltipItem[] 	string | string[] | undefined 		Text to render after the footer section.
Label Callback

The label callback can change the text that displays for a given data point. A common example to show a unit. The example below puts a '$' before every row.

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';

                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        }
    }
});

 

 
        Copied!
    

Label Color Callback

For example, to return a red box with a blue dashed border that has a border radius for each item in the tooltip you could do:

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            tooltip: {
                callbacks: {
                    labelColor: function(context) {
                        return {
                            borderColor: 'rgb(0, 0, 255)',
                            backgroundColor: 'rgb(255, 0, 0)',
                            borderWidth: 2,
                            borderDash: [2, 2],
                            borderRadius: 2,
                        };
                    },
                    labelTextColor: function(context) {
                        return '#543453';
                    }
                }
            }
        }
    }
});

 

 
        Copied!
    

Label Point Style Callback

For example, to draw triangles instead of the regular color box for each item in the tooltip, you could do:

const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            tooltip: {
                usePointStyle: true,
                callbacks: {
                    labelPointStyle: function(context) {
                        return {
                            pointStyle: 'triangle',
                            rotation: 0
                        };
                    }
                }
            }
        }
    }
});

 

 
        Copied!
    

Tooltip Item Context

The tooltip items passed to the tooltip callbacks implement the following interface.

{
    // The chart the tooltip is being shown on
    chart: Chart

    // Label for the tooltip
    label: string,

    // Parsed data values for the given `dataIndex` and `datasetIndex`
    parsed: object,

    // Raw data values for the given `dataIndex` and `datasetIndex`
    raw: object,

    // Formatted value for the tooltip
    formattedValue: string,

    // The dataset the item comes from
    dataset: object

    // Index of the dataset the item comes from
    datasetIndex: number,

    // Index of this data item in the dataset
    dataIndex: number,

    // The chart element (point, arc, bar, etc.) for this tooltip item
    element: Element,
}

 

 
        Copied!
    

External (Custom) Tooltips

External tooltips allow you to hook into the tooltip rendering process so that you can render the tooltip in your own custom way. Generally this is used to create an HTML tooltip instead of an on-canvas tooltip. The external option takes a function which is passed a context parameter containing the chart and tooltip. You can enable external tooltips in the global or chart configuration like so:

const myPieChart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: {
        plugins: {
            tooltip: {
                // Disable the on-canvas tooltip
                enabled: false,

                external: function(context) {
                    // Tooltip Element
                    let tooltipEl = document.getElementById('chartjs-tooltip');

                    // Create element on first render
                    if (!tooltipEl) {
                        tooltipEl = document.createElement('div');
                        tooltipEl.id = 'chartjs-tooltip';
                        tooltipEl.innerHTML = '<table></table>';
                        document.body.appendChild(tooltipEl);
                    }

                    // Hide if no tooltip
                    const tooltipModel = context.tooltip;
                    if (tooltipModel.opacity === 0) {
                        tooltipEl.style.opacity = 0;
                        return;
                    }

                    // Set caret Position
                    tooltipEl.classList.remove('above', 'below', 'no-transform');
                    if (tooltipModel.yAlign) {
                        tooltipEl.classList.add(tooltipModel.yAlign);
                    } else {
                        tooltipEl.classList.add('no-transform');
                    }

                    function getBody(bodyItem) {
                        return bodyItem.lines;
                    }

                    // Set Text
                    if (tooltipModel.body) {
                        const titleLines = tooltipModel.title || [];
                        const bodyLines = tooltipModel.body.map(getBody);

                        let innerHtml = '<thead>';

                        titleLines.forEach(function(title) {
                            innerHtml += '<tr><th>' + title + '</th></tr>';
                        });
                        innerHtml += '</thead><tbody>';

                        bodyLines.forEach(function(body, i) {
                            const colors = tooltipModel.labelColors[i];
                            let style = 'background:' + colors.backgroundColor;
                            style += '; border-color:' + colors.borderColor;
                            style += '; border-width: 2px';
                            const span = '<span style="' + style + '">' + body + '</span>';
                            innerHtml += '<tr><td>' + span + '</td></tr>';
                        });
                        innerHtml += '</tbody>';

                        let tableRoot = tooltipEl.querySelector('table');
                        tableRoot.innerHTML = innerHtml;
                    }

                    const position = context.chart.canvas.getBoundingClientRect();
                    const bodyFont = Chart.helpers.toFont(tooltipModel.options.bodyFont);

                    // Display, position, and set styles for font
                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.position = 'absolute';
                    tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                    tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                    tooltipEl.style.font = bodyFont.string;
                    tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px';
                    tooltipEl.style.pointerEvents = 'none';
                }
            }
        }
    }
});

 

 
        Copied!
    

See samples for examples on how to get started with external tooltips.
Tooltip Model

The tooltip model contains parameters that can be used to render the tooltip.

{
    chart: Chart,

    // The items that we are rendering in the tooltip. See Tooltip Item Interface section
    dataPoints: TooltipItem[],

    // Positioning
    xAlign: string,
    yAlign: string,

    // X and Y properties are the top left of the tooltip
    x: number,
    y: number,
    width: number,
    height: number,
    // Where the tooltip points to
    caretX: number,
    caretY: number,

    // Body
    // The body lines that need to be rendered
    // Each object contains 3 parameters
    // before: string[] // lines of text before the line with the color square
    // lines: string[], // lines of text to render as the main item with color square
    // after: string[], // lines of text to render after the main lines
    body: object[],
    // lines of text that appear after the title but before the body
    beforeBody: string[],
    // line of text that appear after the body and before the footer
    afterBody: string[],

    // Title
    // lines of text that form the title
    title: string[],

    // Footer
    // lines of text that form the footer
    footer: string[],

    // style to render for each item in body[]. This is the style of the squares in the tooltip
    labelColors: TooltipLabelStyle[],
    labelTextColors: Color[],
    labelPointStyles: { pointStyle: PointStyle; rotation: number }[],

    // 0 opacity is a hidden tooltip
    opacity: number,

    // tooltip options
    options: Object
}

 

 
        Copied!
    

Custom Position Modes

New modes can be defined by adding functions to the Chart.Tooltip.positioners map.

Example:

import { Tooltip } from 'chart.js';

/**
 * Custom positioner
 * @function Tooltip.positioners.myCustomPositioner
 * @param elements {Chart.Element[]} the tooltip elements
 * @param eventPosition {Point} the position of the event in canvas coordinates
 * @returns {TooltipPosition} the tooltip position
 */
Tooltip.positioners.myCustomPositioner = function(elements, eventPosition) {
    // A reference to the tooltip model
    const tooltip = this;

    /* ... */

    return {
        x: 0,
        y: 0
        // You may also include xAlign and yAlign to override those tooltip options.
    };
};

// Then, to use it...
new Chart(ctx, {
    data,
    options: {
        plugins: {
            tooltip: {
                position: 'myCustomPositioner'
            }
        }
    }
})

 

 
        Copied!
    

See samples for a more detailed example.

If you're using TypeScript, you'll also need to register the new mode:

declare module 'chart.js' {
  interface TooltipPositionerMap {
    myCustomPositioner: TooltipPositionerFunction<ChartType>;
  }
}

 

 
        Copied!
    

Default font overrides

By default, the titleFont, bodyFont and footerFont listen to the Chart.defaults.font options for setting its values. Overriding these normally by accessing the object won't work because it is backed by a get function that looks to the default font namespace. So you will need to override this get function with your own function that returns the desired config.

Example:

Chart.defaults.plugins.tooltip.titleFont = () => ({ size: 20, lineHeight: 1.2, weight: 800 });

 

 
 Area Chart

Both line and radar charts support a fill option on the dataset object which can be used to create space between two datasets or a dataset and a boundary, i.e. the scale origin, start, or end (see filling modes).

Note

This feature is implemented by the filler plugin

.
Filling modes
Mode 	Type 	Values
Absolute dataset index 	number 	1, 2, 3, ...
Relative dataset index 	string 	'-1', '-2', '+1', ...
Boundary 	string 	'start', 'end', 'origin'
Disabled 1 	boolean 	false
Stacked value below 	string 	'stack'
Axis value 	object 	{ value: number; }
Shape (fill inside line) 	string 	'shape'

    1 for backward compatibility, fill: true is equivalent to fill: 'origin'

Example

new Chart(ctx, {
    data: {
        datasets: [
            {fill: 'origin'},      // 0: fill to 'origin'
            {fill: '+2'},          // 1: fill to dataset 3
            {fill: 1},             // 2: fill to dataset 1
            {fill: false},         // 3: no fill
            {fill: '-2'},          // 4: fill to dataset 2
            {fill: {value: 25}}    // 5: fill to axis value 25
        ]
    }
});

 

 
        Copied!
    

If you need to support multiple colors when filling from one dataset to another, you may specify an object with the following option :
Param 	Type 	Description
target 	number, string, boolean, object 	The accepted values are the same as the filling mode values, so you may use absolute and relative dataset indexes and/or boundaries.
above 	Color 	If no color is set, the default color will be the background color of the chart.
below 	Color 	Same as the above.
Example with multiple colors

new Chart(ctx, {
    data: {
        datasets: [
            {
              fill: {
                target: 'origin',
                above: 'rgb(255, 0, 0)',   // Area will be red above the origin
                below: 'rgb(0, 0, 255)'    // And blue below the origin
              }
            }
        ]
    }
});

 

 
        Copied!
    

Configuration

Namespace: options.plugins.filler
Option 	Type 	Default 	Description
drawTime 	string 	beforeDatasetDraw 	Filler draw time. Supported values: 'beforeDraw', 'beforeDatasetDraw', 'beforeDatasetsDraw'
propagate
	boolean 	true 	Fill propagation when target is hidden.
propagate

propagate takes a boolean value (default: true).

If true, the fill area will be recursively extended to the visible target defined by the fill value of hidden dataset targets:
Example using propagate

new Chart(ctx, {
    data: {
        datasets: [
            {fill: 'origin'},   // 0: fill to 'origin'
            {fill: '-1'},       // 1: fill to dataset 0
            {fill: 1},          // 2: fill to dataset 1
            {fill: false},      // 3: no fill
            {fill: '-2'}        // 4: fill to dataset 2
        ]
    },
    options: {
        plugins: {
            filler: {
                propagate: true
            }
        }
    }
});

 

 
        Copied!
    

propagate: true: -if dataset 2 is hidden, dataset 4 will fill to dataset 1 -if dataset 2 and 1 are hidden, dataset 4 will fill to 'origin'

propagate: false: -if dataset 2 and/or 4 are hidden, dataset 4 will not be filled

Bar Chart

A bar chart provides a way of showing data values represented as vertical bars. It is sometimes used to show trend data, and the comparison of multiple data sets side by side.

const config = {
  type: 'bar',
  data: data,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  },
};

Dataset Properties

Namespaces:

    data.datasets[index] - options for this dataset only
    options.datasets.bar - options for all bar datasets
    options.elements.bar - options for all bar elements
    options - options for the whole chart

The bar chart allows a number of properties to be specified for each dataset. These are used to set display properties for a specific dataset. For example, the color of the bars is generally set this way. Only the data option needs to be specified in the dataset namespace.
Name 	Type 	Scriptable 	Indexable 	Default
backgroundColor
	
Color
	Yes 	Yes 	'rgba(0, 0, 0, 0.1)'
base
	number 	Yes 	Yes 	
barPercentage
	number 	- 	- 	0.9
barThickness
	number|string 	- 	- 	
borderColor
	
Color
	Yes 	Yes 	'rgba(0, 0, 0, 0.1)'
borderSkipped
	string|boolean 	Yes 	Yes 	'start'
borderWidth
	number|object 	Yes 	Yes 	0
borderRadius
	number|object 	Yes 	Yes 	0
categoryPercentage
	number 	- 	- 	0.8
clip
	number|object|false 	- 	- 	
data
	object|object[]| number[]|string[] 	- 	- 	required
grouped
	boolean 	- 	- 	true
hoverBackgroundColor
	
Color
	Yes 	Yes 	
hoverBorderColor
	
Color
	Yes 	Yes 	
hoverBorderWidth
	number 	Yes 	Yes 	1
hoverBorderRadius
	number 	Yes 	Yes 	0
indexAxis
	string 	- 	- 	'x'
inflateAmount
	number|'auto' 	Yes 	Yes 	'auto'
maxBarThickness
	number 	- 	- 	
minBarLength
	number 	- 	- 	
label
	string 	- 	- 	''
order
	number 	- 	- 	0
pointStyle
	
pointStyle
	Yes 	- 	'circle'
skipNull
	boolean 	- 	- 	
stack
	string 	- 	- 	'bar'
xAxisID
	string 	- 	- 	first x axis
yAxisID
	string 	- 	- 	first y axis

All these values, if undefined, fallback to the scopes described in option resolution
Example dataset configuration

data: {
    datasets: [{
        barPercentage: 0.5,
        barThickness: 6,
        maxBarThickness: 8,
        minBarLength: 2,
        data: [10, 20, 30, 40, 50, 60, 70]
    }]
};

 

 
        Copied!
    

General
Name 	Description
base 	Base value for the bar in data units along the value axis. If not set, defaults to the value axis base value.
clip 	How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. 0 = clip at chartArea. Clipping can also be configured per side: clip: {left: 5, top: false, right: -2, bottom: 0}
grouped 	Should the bars be grouped on index axis. When true, all the datasets at same index value will be placed next to each other centering on that index value. When false, each bar is placed on its actual index-axis value.
indexAxis 	The base axis of the dataset. 'x' for vertical bars and 'y' for horizontal bars.
label 	The label for the dataset which appears in the legend and tooltips.
order 	The drawing order of dataset. Also affects order for stacking, tooltip and legend. more
skipNull 	If true, null or undefined values will not be used for spacing calculations when determining bar size.
stack 	The ID of the group to which this dataset belongs to (when stacked, each group will be a separate stack). more
xAxisID 	The ID of the x-axis to plot this dataset on.
yAxisID 	The ID of the y-axis to plot this dataset on.
Styling

The style of each bar can be controlled with the following properties:
Name 	Description
backgroundColor 	The bar background color.
borderColor 	The bar border color.
borderSkipped
	The edge to skip when drawing bar.
borderWidth
	The bar border width (in pixels).
borderRadius
	The bar border radius (in pixels).
minBarLength 	Set this to ensure that bars have a minimum length in pixels.
pointStyle 	Style of the point for legend. more...

All these values, if undefined, fallback to the associated elements.bar.* options.
borderSkipped

This setting is used to avoid drawing the bar stroke at the base of the fill, or disable the border radius. In general, this does not need to be changed except when creating chart types that derive from a bar chart.

Note

For negative bars in a vertical chart, top and bottom are flipped. Same goes for left and right in a horizontal chart.

Options are:

    'start'
    'end'
    'middle' (only valid on stacked bars: the borders between bars are skipped)
    'bottom'
    'left'
    'top'
    'right'
    false (don't skip any borders)
    true (skip all borders)

borderWidth

If this value is a number, it is applied to all sides of the rectangle (left, top, right, bottom), except borderSkipped. If this value is an object, the left property defines the left border width. Similarly, the right, top, and bottom properties can also be specified. Omitted borders and borderSkipped are skipped.
borderRadius

If this value is a number, it is applied to all corners of the rectangle (topLeft, topRight, bottomLeft, bottomRight), except corners touching the borderSkipped. If this value is an object, the topLeft property defines the top-left corners border radius. Similarly, the topRight, bottomLeft, and bottomRight properties can also be specified. Omitted corners and those touching the borderSkipped are skipped. For example if the top border is skipped, the border radius for the corners topLeft and topRight will be skipped as well.

Stacked Charts

When the border radius is supplied as a number and the chart is stacked, the radius will only be applied to the bars that are at the edges of the stack or where the bar is floating. The object syntax can be used to override this behavior.
inflateAmount

This option can be used to inflate the rects that are used to draw the bars. This can be used to hide artifacts between bars when barPercentage * categoryPercentage is 1. The default value 'auto' should work in most cases.
Interactions

The interaction with each bar can be controlled with the following properties:
Name 	Description
hoverBackgroundColor 	The bar background color when hovered.
hoverBorderColor 	The bar border color when hovered.
hoverBorderWidth 	The bar border width when hovered (in pixels).
hoverBorderRadius 	The bar border radius when hovered (in pixels).

All these values, if undefined, fallback to the associated elements.bar.* options.
barPercentage

Percent (0-1) of the available width each bar should be within the category width. 1.0 will take the whole category width and put the bars right next to each other. more...
categoryPercentage

Percent (0-1) of the available width each category should be within the sample width. more...
barThickness

If this value is a number, it is applied to the width of each bar, in pixels. When this is enforced, barPercentage and categoryPercentage are ignored.

If set to 'flex', the base sample widths are calculated automatically based on the previous and following samples so that they take the full available widths without overlap. Then, bars are sized using barPercentage and categoryPercentage. There is no gap when the percentage options are 1. This mode generates bars with different widths when data are not evenly spaced.

If not set (default), the base sample widths are calculated using the smallest interval that prevents bar overlapping, and bars are sized using barPercentage and categoryPercentage. This mode always generates bars equally sized.
maxBarThickness

Set this to ensure that bars are not sized thicker than this.
Scale Configuration

The bar chart sets unique default values for the following configuration from the associated scale options:
Name 	Type 	Default 	Description
offset 	boolean 	true 	If true, extra space is added to both edges and the axis is scaled to fit into the chart area.
grid.offset 	boolean 	true 	If true, the bars for a particular data point fall between the grid lines. The grid line will move to the left by one half of the tick interval. If false, the grid line will go right down the middle of the bars. more...
Example scale configuration

options = {
    scales: {
        x: {
            grid: {
              offset: true
            }
        }
    }
};

 

 
        Copied!
    

Offset Grid Lines

If true, the bars for a particular data point fall between the grid lines. The grid line will move to the left by one half of the tick interval, which is the space between the grid lines. If false, the grid line will go right down the middle of the bars. This is set to true for a category scale in a bar chart while false for other scales or chart types by default.
Default Options

It is common to want to apply a configuration setting to all created bar charts. The global bar chart settings are stored in Chart.overrides.bar. Changing the global options only affects charts created after the change. Existing charts are not changed.
barPercentage vs categoryPercentage

The following shows the relationship between the bar percentage option and the category percentage option.

// categoryPercentage: 1.0
// barPercentage: 1.0
Bar:        | 1.0 | 1.0 |
Category:   |    1.0    |
Sample:     |===========|

// categoryPercentage: 1.0
// barPercentage: 0.5
Bar:          |.5|  |.5|
Category:  |      1.0     |
Sample:    |==============|

// categoryPercentage: 0.5
// barPercentage: 1.0
Bar:             |1.0||1.0|
Category:        |   .5   |
Sample:     |==================|

 

 
        Copied!
    

Data Structure

All the supported data structures can be used with bar charts.
Stacked Bar Chart

Bar charts can be configured into stacked bar charts by changing the settings on the X and Y axes to enable stacking. Stacked bar charts can be used to show how one data series is made up of a number of smaller pieces.

const stackedBar = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
        scales: {
            x: {
                stacked: true
            },
            y: {
                stacked: true
            }
        }
    }
});

 

 
        Copied!
    

Horizontal Bar Chart

A horizontal bar chart is a variation on a vertical bar chart. It is sometimes used to show trend data, and the comparison of multiple data sets side by side. To achieve this, you will have to set the indexAxis property in the options object to 'y'. The default for this property is 'x' and thus will show vertical bars.

const config = {
  type: 'bar',
  data,
  options: {
    indexAxis: 'y',
  }
};

Horizontal Bar Chart config Options

The configuration options for the horizontal bar chart are the same as for the bar chart. However, any options specified on the x-axis in a bar chart, are applied to the y-axis in a horizontal bar chart.
Internal data format

{x, y, _custom} where _custom is an optional object defining stacked bar properties: {start, end, barStart, barEnd, min, max}. start and end are the input values. Those two are repeated in barStart (closer to origin), barEnd (further from origin), min and max.

Bubble Chart

A bubble chart is used to display three dimensions of data at the same time. The location of the bubble is determined by the first two dimensions and the corresponding horizontal and vertical axes. The third dimension is represented by the size of the individual bubbles.

const config = {
  type: 'bubble',
  data: data,
  options: {}
};

Dataset Properties

Namespaces:

    data.datasets[index] - options for this dataset only
    options.datasets.bubble - options for all bubble datasets
    options.elements.point - options for all point elements
    options - options for the whole chart

The bubble chart allows a number of properties to be specified for each dataset. These are used to set display properties for a specific dataset. For example, the colour of the bubbles is generally set this way.
Name 	Type 	Scriptable 	Indexable 	Default
backgroundColor
	
Color
	Yes 	Yes 	'rgba(0, 0, 0, 0.1)'
borderColor
	
Color
	Yes 	Yes 	'rgba(0, 0, 0, 0.1)'
borderWidth
	number 	Yes 	Yes 	3
clip
	number|object|false 	- 	- 	undefined
data
	object[] 	- 	- 	required
drawActiveElementsOnTop
	boolean 	Yes 	Yes 	true
hoverBackgroundColor
	
Color
	Yes 	Yes 	undefined
hoverBorderColor
	
Color
	Yes 	Yes 	undefined
hoverBorderWidth
	number 	Yes 	Yes 	1
hoverRadius
	number 	Yes 	Yes 	4
hitRadius
	number 	Yes 	Yes 	1
label
	string 	- 	- 	undefined
order
	number 	- 	- 	0
pointStyle
	
pointStyle
	Yes 	Yes 	'circle'
rotation
	number 	Yes 	Yes 	0
radius
	number 	Yes 	Yes 	3

All these values, if undefined, fallback to the scopes described in option resolution
General
Name 	Description
clip 	How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. 0 = clip at chartArea. Clipping can also be configured per side: clip: {left: 5, top: false, right: -2, bottom: 0}
drawActiveElementsOnTop 	Draw the active bubbles of a dataset over the other bubbles of the dataset
label 	The label for the dataset which appears in the legend and tooltips.
order 	The drawing order of dataset. Also affects order for tooltip and legend. more
Styling

The style of each bubble can be controlled with the following properties:
Name 	Description
backgroundColor 	bubble background color.
borderColor 	bubble border color.
borderWidth 	bubble border width (in pixels).
pointStyle 	bubble shape style.
rotation 	bubble rotation (in degrees).
radius 	bubble radius (in pixels).

All these values, if undefined, fallback to the associated elements.point.* options.
Interactions

The interaction with each bubble can be controlled with the following properties:
Name 	Description
hitRadius 	bubble additional radius for hit detection (in pixels).
hoverBackgroundColor 	bubble background color when hovered.
hoverBorderColor 	bubble border color when hovered.
hoverBorderWidth 	bubble border width when hovered (in pixels).
hoverRadius 	bubble additional radius when hovered (in pixels).

All these values, if undefined, fallback to the associated elements.point.* options.
Default Options

We can also change the default values for the Bubble chart type. Doing so will give all bubble charts created after this point the new defaults. The default configuration for the bubble chart can be accessed at Chart.overrides.bubble.
Data Structure

Bubble chart datasets need to contain a data array of points, each point represented by an object containing the following properties:

{
    // X Value
    x: number,

    // Y Value
    y: number,

    // Bubble radius in pixels (not scaled).
    r: number
}

 

 
        Copied!
    

Important: the radius property, r is not scaled by the chart, it is the raw radius in pixels of the bubble that is drawn on the canvas.
Internal data format

{x, y, _custom} where _custom is the radius.

Doughnut and Pie Charts

Pie and doughnut charts are probably the most commonly used charts. They are divided into segments, the arc of each segment shows the proportional value of each piece of data.

They are excellent at showing the relational proportions between data.

Pie and doughnut charts are effectively the same class in Chart.js, but have one different default value - their cutout. This equates to what portion of the inner should be cut out. This defaults to 0 for pie charts, and '50%' for doughnuts.

They are also registered under two aliases in the Chart core. Other than their different default value, and different alias, they are exactly the same.

    Doughnut
    Pie

const config = {
  type: 'doughnut',
  data: data,
};

Dataset Properties

Namespaces:

    data.datasets[index] - options for this dataset only
    options.datasets.doughnut - options for all doughnut datasets
    options.datasets.pie - options for all pie datasets
    options.elements.arc - options for all arc elements
    options - options for the whole chart

The doughnut/pie chart allows a number of properties to be specified for each dataset. These are used to set display properties for a specific dataset. For example, the colours of the dataset's arcs are generally set this way.
Name 	Type 	Scriptable 	Indexable 	Default
backgroundColor
	
Color
	Yes 	Yes 	'rgba(0, 0, 0, 0.1)'
borderAlign
	'center'|'inner' 	Yes 	Yes 	'center'
borderColor
	
Color
	Yes 	Yes 	'#fff'
borderDash
	number[] 	Yes 	- 	[]
borderDashOffset
	number 	Yes 	- 	0.0
borderJoinStyle
	'round'|'bevel'|'miter' 	Yes 	Yes 	undefined
borderRadius
	number|object 	Yes 	Yes 	0
borderWidth
	number 	Yes 	Yes 	2
circumference
	number 	- 	- 	undefined
clip
	number|object|false 	- 	- 	undefined
data
	number[] 	- 	- 	required
hoverBackgroundColor
	
Color
	Yes 	Yes 	undefined
hoverBorderColor
	
Color
	Yes 	Yes 	undefined
hoverBorderDash
	number[] 	Yes 	- 	undefined
hoverBorderDashOffset
	number 	Yes 	- 	undefined
hoverBorderJoinStyle
	'round'|'bevel'|'miter' 	Yes 	Yes 	undefined
hoverBorderWidth
	number 	Yes 	Yes 	undefined
hoverOffset
	number 	Yes 	Yes 	0
offset
	number|number[] 	Yes 	Yes 	0
rotation
	number 	- 	- 	undefined
spacing
	number 	- 	- 	0
weight
	number 	- 	- 	1

All these values, if undefined, fallback to the scopes described in option resolution
General
Name 	Description
circumference 	Per-dataset override for the sweep that the arcs cover
clip 	How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. 0 = clip at chartArea. Clipping can also be configured per side: clip: {left: 5, top: false, right: -2, bottom: 0}
rotation 	Per-dataset override for the starting angle to draw arcs from
Styling

The style of each arc can be controlled with the following properties:
Name 	Description
backgroundColor 	arc background color.
borderColor 	arc border color.
borderDash 	arc border length and spacing of dashes. See MDN
.
borderDashOffset 	arc border offset for line dashes. See MDN
.
borderJoinStyle 	arc border join style. See MDN
.
borderWidth 	arc border width (in pixels).
offset 	arc offset (in pixels).
spacing 	Fixed arc offset (in pixels). Similar to offset but applies to all arcs.
weight 	The relative thickness of the dataset. Providing a value for weight will cause the pie or doughnut dataset to be drawn with a thickness relative to the sum of all the dataset weight values.

All these values, if undefined, fallback to the associated elements.arc.* options.
Border Alignment

The following values are supported for borderAlign.

    'center' (default)
    'inner'

When 'center' is set, the borders of arcs next to each other will overlap. When 'inner' is set, it is guaranteed that all borders will not overlap.
Border Radius

If this value is a number, it is applied to all corners of the arc (outerStart, outerEnd, innerStart, innerRight). If this value is an object, the outerStart property defines the outer-start corner's border radius. Similarly, the outerEnd, innerStart, and innerEnd properties can also be specified.
Interactions

The interaction with each arc can be controlled with the following properties:
Name 	Description
hoverBackgroundColor 	arc background color when hovered.
hoverBorderColor 	arc border color when hovered.
hoverBorderDash 	arc border length and spacing of dashes when hovered. See MDN
.
hoverBorderDashOffset 	arc border offset for line dashes when hovered. See MDN
.
hoverBorderJoinStyle 	arc border join style when hovered. See MDN
.
hoverBorderWidth 	arc border width when hovered (in pixels).
hoverOffset 	arc offset when hovered (in pixels).

All these values, if undefined, fallback to the associated elements.arc.* options.
Config Options

These are the customisation options specific to Pie & Doughnut charts. These options are looked up on access, and form together with the global chart configuration the options of the chart.
Name 	Type 	Default 	Description
cutout 	number|string 	50% - for doughnut, 0 - for pie 	The portion of the chart that is cut out of the middle. If string and ending with '%', percentage of the chart radius. number is considered to be pixels.
radius 	number|string 	100% 	The outer radius of the chart. If string and ending with '%', percentage of the maximum radius. number is considered to be pixels.
rotation 	number 	0 	Starting angle to draw arcs from.
circumference 	number 	360 	Sweep to allow arcs to cover.
animation.animateRotate 	boolean 	true 	If true, the chart will animate in with a rotation animation. This property is in the options.animation object.
animation.animateScale 	boolean 	false 	If true, will animate scaling the chart from the center outwards.
Default Options

We can also change these default values for each Doughnut type that is created, this object is available at Chart.overrides.doughnut. Pie charts also have a clone of these defaults available to change at Chart.overrides.pie, with the only difference being cutout being set to 0.
Data Structure

For a pie chart, datasets need to contain an array of data points. The data points should be a number, Chart.js will total all the numbers and calculate the relative proportion of each.

You also need to specify an array of labels so that tooltips appear correctly.

data = {
    datasets: [{
        data: [10, 20, 30]
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: [
        'Red',
        'Yellow',
        'Blue'
    ]
};

 

 

 Line Chart

A line chart is a way of plotting data points on a line. Often, it is used to show trend data, or the comparison of two data sets.

const config = {
  type: 'line',
  data: data,
};

Dataset Properties

Namespaces:

    data.datasets[index] - options for this dataset only
    options.datasets.line - options for all line datasets
    options.elements.line - options for all line elements
    options.elements.point - options for all point elements
    options - options for the whole chart

The line chart allows a number of properties to be specified for each dataset. These are used to set display properties for a specific dataset. For example, the colour of a line is generally set this way.
Name 	Type 	Scriptable 	Indexable 	Default
backgroundColor
	
Color
	Yes 	- 	'rgba(0, 0, 0, 0.1)'
borderCapStyle
	string 	Yes 	- 	'butt'
borderColor
	
Color
	Yes 	- 	'rgba(0, 0, 0, 0.1)'
borderDash
	number[] 	Yes 	- 	[]
borderDashOffset
	number 	Yes 	- 	0.0
borderJoinStyle
	'round'|'bevel'|'miter' 	Yes 	- 	'miter'
borderWidth
	number 	Yes 	- 	3
clip
	number|object|false 	- 	- 	undefined
cubicInterpolationMode
	string 	Yes 	- 	'default'
data
	object|object[]| number[]|string[] 	- 	- 	required
drawActiveElementsOnTop
	boolean 	Yes 	Yes 	true
fill
	boolean|string 	Yes 	- 	false
hoverBackgroundColor
	
Color
	Yes 	- 	undefined
hoverBorderCapStyle
	string 	Yes 	- 	undefined
hoverBorderColor
	
Color
	Yes 	- 	undefined
hoverBorderDash
	number[] 	Yes 	- 	undefined
hoverBorderDashOffset
	number 	Yes 	- 	undefined
hoverBorderJoinStyle
	'round'|'bevel'|'miter' 	Yes 	- 	undefined
hoverBorderWidth
	number 	Yes 	- 	undefined
indexAxis
	string 	- 	- 	'x'
label
	string 	- 	- 	''
order
	number 	- 	- 	0
pointBackgroundColor
	Color 	Yes 	Yes 	'rgba(0, 0, 0, 0.1)'
pointBorderColor
	Color 	Yes 	Yes 	'rgba(0, 0, 0, 0.1)'
pointBorderWidth
	number 	Yes 	Yes 	1
pointHitRadius
	number 	Yes 	Yes 	1
pointHoverBackgroundColor
	Color 	Yes 	Yes 	undefined
pointHoverBorderColor
	Color 	Yes 	Yes 	undefined
pointHoverBorderWidth
	number 	Yes 	Yes 	1
pointHoverRadius
	number 	Yes 	Yes 	4
pointRadius
	number 	Yes 	Yes 	3
pointRotation
	number 	Yes 	Yes 	0
pointStyle
	
pointStyle
	Yes 	Yes 	'circle'
segment
	object 	- 	- 	undefined
showLine
	boolean 	- 	- 	true
spanGaps
	boolean|number 	- 	- 	undefined
stack
	string 	- 	- 	'line'
stepped
	boolean|string 	- 	- 	false
tension
	number 	- 	- 	0
xAxisID
	string 	- 	- 	first x axis
yAxisID
	string 	- 	- 	first y axis

All these values, if undefined, fallback to the scopes described in option resolution
General
Name 	Description
clip 	How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. 0 = clip at chartArea. Clipping can also be configured per side: clip: {left: 5, top: false, right: -2, bottom: 0}
drawActiveElementsOnTop 	Draw the active points of a dataset over the other points of the dataset
indexAxis 	The base axis of the dataset. 'x' for horizontal lines and 'y' for vertical lines.
label 	The label for the dataset which appears in the legend and tooltips.
order 	The drawing order of dataset. Also affects order for stacking, tooltip and legend. more
stack 	The ID of the group to which this dataset belongs to (when stacked, each group will be a separate stack). more
xAxisID 	The ID of the x-axis to plot this dataset on.
yAxisID 	The ID of the y-axis to plot this dataset on.
Point Styling

The style of each point can be controlled with the following properties:
Name 	Description
pointBackgroundColor 	The fill color for points.
pointBorderColor 	The border color for points.
pointBorderWidth 	The width of the point border in pixels.
pointHitRadius 	The pixel size of the non-displayed point that reacts to mouse events.
pointRadius 	The radius of the point shape. If set to 0, the point is not rendered.
pointRotation 	The rotation of the point in degrees.
pointStyle 	Style of the point. more...

All these values, if undefined, fallback first to the dataset options then to the associated elements.point.* options.
Line Styling

The style of the line can be controlled with the following properties:
Name 	Description
backgroundColor 	The line fill color.
borderCapStyle 	Cap style of the line. See MDN
.
borderColor 	The line color.
borderDash 	Length and spacing of dashes. See MDN
.
borderDashOffset 	Offset for line dashes. See MDN
.
borderJoinStyle 	Line joint style. See MDN
.
borderWidth 	The line width (in pixels).
fill 	How to fill the area under the line. See area charts.
tension 	Bezier curve tension of the line. Set to 0 to draw straightlines. This option is ignored if monotone cubic interpolation is used.
showLine 	If false, the line is not drawn for this dataset.
spanGaps 	If true, lines will be drawn between points with no or null data. If false, points with null data will create a break in the line. Can also be a number specifying the maximum gap length to span. The unit of the value depends on the scale used.

If the value is undefined, the values fallback to the associated elements.line.* options.
Interactions

The interaction with each point can be controlled with the following properties:
Name 	Description
pointHoverBackgroundColor 	Point background color when hovered.
pointHoverBorderColor 	Point border color when hovered.
pointHoverBorderWidth 	Border width of point when hovered.
pointHoverRadius 	The radius of the point when hovered.
cubicInterpolationMode

The following interpolation modes are supported.

    'default'
    'monotone'

The 'default' algorithm uses a custom weighted cubic interpolation, which produces pleasant curves for all types of datasets.

The 'monotone' algorithm is more suited to y = f(x) datasets: it preserves monotonicity (or piecewise monotonicity) of the dataset being interpolated, and ensures local extremums (if any) stay at input data points.

If left untouched (undefined), the global options.elements.line.cubicInterpolationMode property is used.
Segment

Line segment styles can be overridden by scriptable options in the segment object. Currently, all of the border* and backgroundColor options are supported. The segment styles are resolved for each section of the line between each point. undefined fallbacks to main line styles.

TIP

To be able to style gaps, you need the spanGaps option enabled.

Context for the scriptable segment contains the following properties:

    type: 'segment'
    p0: first point element
    p1: second point element
    p0DataIndex: index of first point in the data array
    p1DataIndex: index of second point in the data array
    datasetIndex: dataset index

Example usage
Stepped

The following values are supported for stepped.

    false: No Step Interpolation (default)
    true: Step-before Interpolation (eq. 'before')
    'before': Step-before Interpolation
    'after': Step-after Interpolation
    'middle': Step-middle Interpolation

If the stepped value is set to anything other than false, tension will be ignored.
Default Options

It is common to want to apply a configuration setting to all created line charts. The global line chart settings are stored in Chart.overrides.line. Changing the global options only affects charts created after the change. Existing charts are not changed.

For example, to configure all line charts with spanGaps = true you would do:

Chart.overrides.line.spanGaps = true;

 

 
        Copied!
    

Data Structure

All the supported data structures can be used with line charts.
Stacked Area Chart

Line charts can be configured into stacked area charts by changing the settings on the y-axis to enable stacking. Stacked area charts can be used to show how one data trend is made up of a number of smaller pieces.

const stackedLine = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            y: {
                stacked: true
            }
        }
    }
});

 

 
        Copied!
    

Vertical Line Chart

A vertical line chart is a variation on the horizontal line chart. To achieve this, you will have to set the indexAxis property in the options object to 'y'. The default for this property is 'x' and thus will show horizontal lines.

const config = {
  type: 'line',
  data: data,
  options: {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true
      }
    }
  }
};

Config Options

The configuration options for the vertical line chart are the same as for the line chart. However, any options specified on the x-axis in a line chart, are applied to the y-axis in a vertical line chart.
Internal data format

{x, y}



Mixed Chart Types

With Chart.js, it is possible to create mixed charts that are a combination of two or more different chart types. A common example is a bar chart that also includes a line dataset.

When creating a mixed chart, we specify the chart type on each dataset.

const mixedChart = new Chart(ctx, {
    data: {
        datasets: [{
            type: 'bar',
            label: 'Bar Dataset',
            data: [10, 20, 30, 40]
        }, {
            type: 'line',
            label: 'Line Dataset',
            data: [50, 50, 50, 50],
        }],
        labels: ['January', 'February', 'March', 'April']
    },
    options: options
});

 

 
        Copied!
    

At this point, we have a chart rendering how we'd like. It's important to note that the default options for the charts are only considered at the dataset level and are not merged at the chart level in this case.

const config = {
  type: 'scatter',
  data: data,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
};

Drawing order

By default, datasets are drawn such that the first one is top-most. This can be altered by specifying order option to datasets. order defaults to 0. Note that this also affects stacking, legend, and tooltip. So it's essentially the same as reordering the datasets.

The order property behaves like a weight instead of a specific order, so the higher the number, the sooner that dataset is drawn on the canvas and thus other datasets with a lower order number will get drawn over it.

const mixedChart = new Chart(ctx, {
   type: 'bar',
   data: {
       datasets: [{
           label: 'Bar Dataset',
           data: [10, 20, 30, 40],
           // this dataset is drawn below
           order: 2
       }, {
           label: 'Line Dataset',
           data: [10, 10, 10, 10],
           type: 'line',
           // this dataset is drawn on top
           order: 1
       }],
       labels: ['January', 'February', 'March', 'April']
   },
   options: options
});

 

 
 Polar Area Chart

Polar area charts are similar to pie charts, but each segment has the same angle - the radius of the segment differs depending on the value.

This type of chart is often useful when we want to show a comparison data similar to a pie chart, but also show a scale of values for context.

const config = {
  type: 'polarArea',
  data: data,
  options: {}
};

Dataset Properties

Namespaces:

    data.datasets[index] - options for this dataset only
    options.datasets.polarArea - options for all polarArea datasets
    options.elements.arc - options for all arc elements
    options - options for the whole chart

The following options can be included in a polar area chart dataset to configure options for that specific dataset.
Name 	Type 	Scriptable 	Indexable 	Default
backgroundColor
	
Color
	Yes 	Yes 	'rgba(0, 0, 0, 0.1)'
borderAlign
	'center'|'inner' 	Yes 	Yes 	'center'
borderColor
	
Color
	Yes 	Yes 	'#fff'
borderDash
	number[] 	Yes 	- 	[]
borderDashOffset
	number 	Yes 	- 	0.0
borderJoinStyle
	'round'|'bevel'|'miter' 	Yes 	Yes 	undefined
borderWidth
	number 	Yes 	Yes 	2
clip
	number|object|false 	- 	- 	undefined
data
	number[] 	- 	- 	required
hoverBackgroundColor
	
Color
	Yes 	Yes 	undefined
hoverBorderColor
	
Color
	Yes 	Yes 	undefined
hoverBorderDash
	number[] 	Yes 	- 	undefined
hoverBorderDashOffset
	number 	Yes 	- 	undefined
hoverBorderJoinStyle
	'round'|'bevel'|'miter' 	Yes 	Yes 	undefined
hoverBorderWidth
	number 	Yes 	Yes 	undefined
circular
	boolean 	Yes 	Yes 	true

All these values, if undefined, fallback to the scopes described in option resolution
General
Name 	Description
clip 	How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. 0 = clip at chartArea. Clipping can also be configured per side: clip: {left: 5, top: false, right: -2, bottom: 0}
Styling

The style of each arc can be controlled with the following properties:
Name 	Description
backgroundColor 	arc background color.
borderColor 	arc border color.
borderDash 	arc border length and spacing of dashes. See MDN
.
borderDashOffset 	arc border offset for line dashes. See MDN
.
borderJoinStyle 	arc border join style. See MDN
.
borderWidth 	arc border width (in pixels).
circular 	By default the Arc is curved. If circular: false the Arc will be flat.

All these values, if undefined, fallback to the associated elements.arc.* options.
Border Alignment

The following values are supported for borderAlign.

    'center' (default)
    'inner'

When 'center' is set, the borders of arcs next to each other will overlap. When 'inner' is set, it is guaranteed that all the borders do not overlap.
Interactions

The interaction with each arc can be controlled with the following properties:
Name 	Description
hoverBackgroundColor 	arc background color when hovered.
hoverBorderColor 	arc border color when hovered.
hoverBorderDash 	arc border length and spacing of dashes when hovered. See MDN
.
hoverBorderDashOffset 	arc border offset for line dashes when hovered. See MDN
.
hoverBorderJoinStyle 	arc border join style when hovered. See MDN
.
hoverBorderWidth 	arc border width when hovered (in pixels).

All these values, if undefined, fallback to the associated elements.arc.* options.
Config Options

These are the customisation options specific to Polar Area charts. These options are looked up on access, and form together with the global chart default options the options of the chart.
Name 	Type 	Default 	Description
animation.animateRotate 	boolean 	true 	If true, the chart will animate in with a rotation animation. This property is in the options.animation object.
animation.animateScale 	boolean 	true 	If true, will animate scaling the chart from the center outwards.

The polar area chart uses the radialLinear scale. Additional configuration is provided via the scale.
Default Options

We can also change these default values for each PolarArea type that is created, this object is available at Chart.overrides.polarArea. Changing the global options only affects charts created after the change. Existing charts are not changed.

For example, to configure all new polar area charts with animateScale = false you would do:

Chart.overrides.polarArea.animation.animateScale = false;

 

 
        Copied!
    

Data Structure

For a polar area chart, datasets need to contain an array of data points. The data points should be a number, Chart.js will total all of the numbers and calculate the relative proportion of each.

You also need to specify an array of labels so that tooltips appear correctly for each slice.

data = {
    datasets: [{
        data: [10, 20, 30]
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: [
        'Red',
        'Yellow',
        'Blue'
    ]
};

 

 
 Radar Chart

A radar chart is a way of showing multiple data points and the variation between them.

They are often useful for comparing the points of two or more different data sets.

const config = {
  type: 'radar',
  data: data,
  options: {
    elements: {
      line: {
        borderWidth: 3
      }
    }
  },
};

Dataset Properties

Namespaces:

    data.datasets[index] - options for this dataset only
    options.datasets.line - options for all line datasets
    options.elements.line - options for all line elements
    options.elements.point - options for all point elements
    options - options for the whole chart

The radar chart allows a number of properties to be specified for each dataset. These are used to set display properties for a specific dataset. For example, the colour of a line is generally set this way.
Name 	Type 	Scriptable 	Indexable 	Default
backgroundColor
	
Color
	Yes 	- 	'rgba(0, 0, 0, 0.1)'
borderCapStyle
	string 	Yes 	- 	'butt'
borderColor
	
Color
	Yes 	- 	'rgba(0, 0, 0, 0.1)'
borderDash
	number[] 	Yes 	- 	[]
borderDashOffset
	number 	Yes 	- 	0.0
borderJoinStyle
	'round'|'bevel'|'miter' 	Yes 	- 	'miter'
borderWidth
	number 	Yes 	- 	3
hoverBackgroundColor
	
Color
	Yes 	- 	undefined
hoverBorderCapStyle
	string 	Yes 	- 	undefined
hoverBorderColor
	
Color
	Yes 	- 	undefined
hoverBorderDash
	number[] 	Yes 	- 	undefined
hoverBorderDashOffset
	number 	Yes 	- 	undefined
hoverBorderJoinStyle
	'round'|'bevel'|'miter' 	Yes 	- 	undefined
hoverBorderWidth
	number 	Yes 	- 	undefined
clip
	number|object|false 	- 	- 	undefined
data
	number[] 	- 	- 	required
fill
	boolean|string 	Yes 	- 	false
label
	string 	- 	- 	''
order
	number 	- 	- 	0
tension
	number 	- 	- 	0
pointBackgroundColor
	Color 	Yes 	Yes 	'rgba(0, 0, 0, 0.1)'
pointBorderColor
	Color 	Yes 	Yes 	'rgba(0, 0, 0, 0.1)'
pointBorderWidth
	number 	Yes 	Yes 	1
pointHitRadius
	number 	Yes 	Yes 	1
pointHoverBackgroundColor
	Color 	Yes 	Yes 	undefined
pointHoverBorderColor
	Color 	Yes 	Yes 	undefined
pointHoverBorderWidth
	number 	Yes 	Yes 	1
pointHoverRadius
	number 	Yes 	Yes 	4
pointRadius
	number 	Yes 	Yes 	3
pointRotation
	number 	Yes 	Yes 	0
pointStyle
	
pointStyle
	Yes 	Yes 	'circle'
spanGaps
	boolean 	- 	- 	undefined

All these values, if undefined, fallback to the scopes described in option resolution
General
Name 	Description
clip 	How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. 0 = clip at chartArea. Clipping can also be configured per side: clip: {left: 5, top: false, right: -2, bottom: 0}
label 	The label for the dataset which appears in the legend and tooltips.
order 	The drawing order of dataset. Also affects order for tooltip and legend. more
Point Styling

The style of each point can be controlled with the following properties:
Name 	Description
pointBackgroundColor 	The fill color for points.
pointBorderColor 	The border color for points.
pointBorderWidth 	The width of the point border in pixels.
pointHitRadius 	The pixel size of the non-displayed point that reacts to mouse events.
pointRadius 	The radius of the point shape. If set to 0, the point is not rendered.
pointRotation 	The rotation of the point in degrees.
pointStyle 	Style of the point. more...

All these values, if undefined, fallback first to the dataset options then to the associated elements.point.* options.
Line Styling

The style of the line can be controlled with the following properties:
Name 	Description
backgroundColor 	The line fill color.
borderCapStyle 	Cap style of the line. See MDN
.
borderColor 	The line color.
borderDash 	Length and spacing of dashes. See MDN
.
borderDashOffset 	Offset for line dashes. See MDN
.
borderJoinStyle 	Line joint style. See MDN
.
borderWidth 	The line width (in pixels).
fill 	How to fill the area under the line. See area charts.
tension 	Bezier curve tension of the line. Set to 0 to draw straight lines.
spanGaps 	If true, lines will be drawn between points with no or null data. If false, points with null data will create a break in the line.

If the value is undefined, the values fallback to the associated elements.line.* options.
Interactions

The interaction with each point can be controlled with the following properties:
Name 	Description
pointHoverBackgroundColor 	Point background color when hovered.
pointHoverBorderColor 	Point border color when hovered.
pointHoverBorderWidth 	Border width of point when hovered.
pointHoverRadius 	The radius of the point when hovered.
Scale Options

The radar chart supports only a single scale. The options for this scale are defined in the scales.r property, which can be referenced from the Linear Radial Axis page.

options = {
    scales: {
        r: {
            angleLines: {
                display: false
            },
            suggestedMin: 50,
            suggestedMax: 100
        }
    }
};

 

 
        Copied!
    

Default Options

It is common to want to apply a configuration setting to all created radar charts. The global radar chart settings are stored in Chart.overrides.radar. Changing the global options only affects charts created after the change. Existing charts are not changed.
Data Structure

The data property of a dataset for a radar chart is specified as an array of numbers. Each point in the data array corresponds to the label at the same index.

data: [20, 10]

 

 
        Copied!
    

For a radar chart, to provide context of what each point means, we include an array of strings that show around each point in the chart.

data: {
    labels: ['Running', 'Swimming', 'Eating', 'Cycling'],
    datasets: [{
        data: [20, 10, 4, 2]
    }]
}

 

 
        Copied!
    

Internal data format

{x, y}

Scatter Chart

Scatter charts are based on basic line charts with the x-axis changed to a linear axis. To use a scatter chart, data must be passed as objects containing X and Y properties. The example below creates a scatter chart with 4 points.

const config = {
  type: 'scatter',
  data: data,
  options: {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom'
      }
    }
  }
};

Dataset Properties

Namespaces:

    data.datasets[index] - options for this dataset only
    options.datasets.scatter - options for all scatter datasets
    options.elements.line - options for all line elements
    options.elements.point - options for all point elements
    options - options for the whole chart

The scatter chart supports all the same properties as the line chart. By default, the scatter chart will override the showLine property of the line chart to false.

The index scale is of the type linear. This means, if you are using the labels array, the values have to be numbers or parsable to numbers, the same applies to the object format for the keys.
Data Structure

Unlike the line chart where data can be supplied in two different formats, the scatter chart only accepts data in a point format.

data: [{
        x: 10,
        y: 20
    }, {
        x: 15,
        y: 10
    }]

 

 
        Copied!
    

Internal data format

{x, y}

Axes

Axes are an integral part of a chart. They are used to determine how data maps to a pixel value on the chart. In a cartesian chart, there is 1 or more X-axis and 1 or more Y-axis to map points onto the 2-dimensional canvas. These axes are known as 'cartesian axes'.

In a radial chart, such as a radar chart or a polar area chart, there is a single axis that maps points in the angular and radial directions. These are known as 'radial axes'.

Scales in Chart.js >v2.0 are significantly more powerful, but also different from those of v1.0.

    Multiple X & Y axes are supported.
    A built-in label auto-skip feature detects would-be overlapping ticks and labels and removes every nth label to keep things displayed normally.
    Scale titles are supported.
    New scale types can be extended without writing an entirely new chart type.

Default scales

The default scaleId's for cartesian charts are 'x' and 'y'. For radial charts: 'r'. Each dataset is mapped to a scale for each axis (x, y or r) it requires. The scaleId's that a dataset is mapped to is determined by the xAxisID, yAxisID or rAxisID. If the ID for an axis is not specified, the first scale for that axis is used. If no scale for an axis is found, a new scale is created.

Some examples:

The following chart will have 'x' and 'y' scales:

let chart = new Chart(ctx, {
  type: 'line'
});

 

 
        Copied!
    

The following chart will have scales 'x' and 'myScale':

let chart = new Chart(ctx, {
  type: 'bar',
  data: {
    datasets: [{
      data: [1, 2, 3]
    }]
  },
  options: {
    scales: {
      myScale: {
        type: 'logarithmic',
        position: 'right', // `axis` is determined by the position as `'y'`
      }
    }
  }
});

 

 
        Copied!
    

The following chart will have scales 'xAxis' and 'yAxis':

let chart = new Chart(ctx, {
  type: 'bar',
  data: {
    datasets: [{
      yAxisID: 'yAxis'
    }]
  },
  options: {
    scales: {
      xAxis: {
        // The axis for this scale is determined from the first letter of the id as `'x'`
        // It is recommended to specify `position` and / or `axis` explicitly.
        type: 'time',
      }
    }
  }
});

 

 
        Copied!
    

The following chart will have 'r' scale:

let chart = new Chart(ctx, {
  type: 'radar'
});

 

 
        Copied!
    

The following chart will have 'myScale' scale:

let chart = new Chart(ctx, {
  type: 'radar',
  scales: {
    myScale: {
      axis: 'r'
    }
  }
});

 

 
        Copied!
    

Common Configuration

Note

These are only the common options supported by all axes. Please see specific axis documentation for all the available options for that axis.
Common options to all axes

Namespace: options.scales[scaleId]
Name 	Type 	Default 	Description
type 	string 		Type of scale being employed. Custom scales can be created and registered with a string key. This allows changing the type of an axis for a chart.
alignToPixels 	boolean 	false 	Align pixel values to device pixels.
backgroundColor 	
Color
		Background color of the scale area.
border 	object 		Border configuration. more...
display 	boolean|string 	true 	Controls the axis global visibility (visible when true, hidden when false). When display: 'auto', the axis is visible only if at least one associated dataset is visible.
grid 	object 		Grid line configuration. more...
min 	number 		User defined minimum number for the scale, overrides minimum value from data. more...
max 	number 		User defined maximum number for the scale, overrides maximum value from data. more...
reverse 	boolean 	false 	Reverse the scale.
stacked 	boolean|string 	false 	Should the data be stacked. more...
suggestedMax 	number 		Adjustment used when calculating the maximum data value. more...
suggestedMin 	number 		Adjustment used when calculating the minimum data value. more...
ticks 	object 		Tick configuration. more...
weight 	number 	0 	The weight used to sort the axis. Higher weights are further away from the chart area.
Tick Configuration

Note

These are only the common tick options supported by all axes. Please see specific axis documentation for all the available tick options for that axis.
Common tick options to all axes

Namespace: options.scales[scaleId].ticks
Name 	Type 	Scriptable 	Default 	Description
backdropColor 	
Color
	Yes 	'rgba(255, 255, 255, 0.75)' 	Color of label backdrops.
backdropPadding 	
Padding
		2 	Padding of label backdrop.
callback 	function 			Returns the string representation of the tick value as it should be displayed on the chart. See callback.
display 	boolean 		true 	If true, show tick labels.
color 	
Color
	Yes 	Chart.defaults.color 	Color of ticks.
font 	Font 	Yes 	Chart.defaults.font 	See Fonts
major 	object 		{} 	Major ticks configuration.
padding 	number 		3 	Sets the offset of the tick labels from the axis
showLabelBackdrop 	boolean 	Yes 	true for radial scale, false otherwise 	If true, draw a background behind the tick labels.
textStrokeColor 	
Color
	Yes 	`` 	The color of the stroke around the text.
textStrokeWidth 	number 	Yes 	0 	Stroke width around the text.
z 	number 		0 	z-index of tick layer. Useful when ticks are drawn on chart area. Values <= 0 are drawn under datasets, > 0 on top.
Axis Range Settings

Given the number of axis range settings, it is important to understand how they all interact with each other.

The suggestedMax and suggestedMin settings only change the data values that are used to scale the axis. These are useful for extending the range of the axis while maintaining the auto-fit behaviour.

let minDataValue = Math.min(mostNegativeValue, options.suggestedMin);
let maxDataValue = Math.max(mostPositiveValue, options.suggestedMax);

 

 
        Copied!
    

In this example, the largest positive value is 50, but the data maximum is expanded out to 100. However, because the lowest data value is below the suggestedMin setting, it is ignored.

let chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: 'First dataset',
            data: [0, 20, 40, 50]
        }],
        labels: ['January', 'February', 'March', 'April']
    },
    options: {
        scales: {
            y: {
                suggestedMin: 50,
                suggestedMax: 100
            }
        }
    }
});

 

 
        Copied!
    

In contrast to the suggested* settings, the min and max settings set explicit ends to the axes. When these are set, some data points may not be visible.
Stacking

By default, data is not stacked. If the stacked option of the value scale (y-axis on horizontal chart) is true, positive and negative values are stacked separately. Additionally, a stack option can be defined per dataset to further divide into stack groups more.... For some charts, you might want to stack positive and negative values together. That can be achieved by specifying stacked: 'single'.
Callbacks

There are a number of config callbacks that can be used to change parameters in the scale at different points in the update process. The options are supplied at the top level of the axis options.

Namespace: options.scales[scaleId]
Name 	Arguments 	Description
beforeUpdate 	axis 	Callback called before the update process starts.
beforeSetDimensions 	axis 	Callback that runs before dimensions are set.
afterSetDimensions 	axis 	Callback that runs after dimensions are set.
beforeDataLimits 	axis 	Callback that runs before data limits are determined.
afterDataLimits 	axis 	Callback that runs after data limits are determined.
beforeBuildTicks 	axis 	Callback that runs before ticks are created.
afterBuildTicks 	axis 	Callback that runs after ticks are created. Useful for filtering ticks.
beforeTickToLabelConversion 	axis 	Callback that runs before ticks are converted into strings.
afterTickToLabelConversion 	axis 	Callback that runs after ticks are converted into strings.
beforeCalculateLabelRotation 	axis 	Callback that runs before tick rotation is determined.
afterCalculateLabelRotation 	axis 	Callback that runs after tick rotation is determined.
beforeFit 	axis 	Callback that runs before the scale fits to the canvas.
afterFit 	axis 	Callback that runs after the scale fits to the canvas.
afterUpdate 	axis 	Callback that runs at the end of the update process.
Updating Axis Defaults

The default configuration for a scale can be easily changed. All you need to do is set the new options to Chart.defaults.scales[type].

For example, to set the minimum value of 0 for all linear scales, you would do the following. Any linear scales created after this time would now have a minimum of 0.

Chart.defaults.scales.linear.min = 0;

 

 
        Copied!
    

Creating New Axes

To create a new axis, see the developer docs.

API

For each chart, there are a set of global prototype methods on the shared chart type which you may find useful. These are available on all charts created with Chart.js, but for the examples, let's use a line chart we've made.

// For example:
const myLineChart = new Chart(ctx, config);

 

 
        Copied!
    

.destroy()

Use this to destroy any chart instances that are created. This will clean up any references stored to the chart object within Chart.js, along with any associated event listeners attached by Chart.js. This must be called before the canvas is reused for a new chart.

// Destroys a specific chart instance
myLineChart.destroy();

 

 
        Copied!
    

.update(mode?)

Triggers an update of the chart. This can be safely called after updating the data object. This will update all scales, legends, and then re-render the chart.

myLineChart.data.datasets[0].data[2] = 50; // Would update the first dataset's value of 'March' to be 50
myLineChart.update(); // Calling update now animates the position of March from 90 to 50.

 

 
        Copied!
    

A mode string can be provided to indicate transition configuration should be used. Core calls this method using any of 'active', 'hide', 'reset', 'resize', 'show' or undefined. 'none' is also a supported mode for skipping animations for single update. Please see animations docs for more details.

Example:

myChart.update('active');

 

 
        Copied!
    

See Updating Charts for more details.
.reset()

Reset the chart to its state before the initial animation. A new animation can then be triggered using update.

myLineChart.reset();

 

 
        Copied!
    

.render()

Triggers a redraw of all chart elements. Note, this does not update elements for new data. Use .update() in that case.
.stop()

Use this to stop any current animation. This will pause the chart during any current animation frame. Call .render() to re-animate.

// Stops the charts animation loop at its current frame
myLineChart.stop();
// => returns 'this' for chainability

 

 
        Copied!
    

.resize(width?, height?)

Use this to manually resize the canvas element. This is run each time the canvas container is resized, but you can call this method manually if you change the size of the canvas nodes container element.

You can call .resize() with no parameters to have the chart take the size of its container element, or you can pass explicit dimensions (e.g., for printing).

// Resizes & redraws to fill its container element
myLineChart.resize();
// => returns 'this' for chainability

// With an explicit size:
myLineChart.resize(width, height);

 

 
        Copied!
    

.clear()

Will clear the chart canvas. Used extensively internally between animation frames, but you might find it useful.

// Will clear the canvas that myLineChart is drawn on
myLineChart.clear();
// => returns 'this' for chainability

 

 
        Copied!
    

.toBase64Image(type?, quality?)

This returns a base 64 encoded string of the chart in its current state.

myLineChart.toBase64Image();
// => returns png data url of the image on the canvas

myLineChart.toBase64Image('image/jpeg', 1)
// => returns a jpeg data url in the highest quality of the canvas

 

 
        Copied!
    

.getElementsAtEventForMode(e, mode, options, useFinalPosition)

Calling getElementsAtEventForMode(e, mode, options, useFinalPosition) on your Chart instance passing an event and a mode will return the elements that are found. The options and useFinalPosition arguments are passed through to the handlers.

To get an item that was clicked on, getElementsAtEventForMode can be used.

function clickHandler(evt) {
    const points = myChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);

    if (points.length) {
        const firstPoint = points[0];
        const label = myChart.data.labels[firstPoint.index];
        const value = myChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
    }
}

 

 
        Copied!
    

.getSortedVisibleDatasetMetas()

Returns an array of all the dataset meta's in the order that they are drawn on the canvas that are not hidden.

const visibleMetas = chart.getSortedVisibleDatasetMetas();

 

 
        Copied!
    

.getDatasetMeta(index)

Looks for the dataset that matches the current index and returns that metadata. This returned data has all of the metadata that is used to construct the chart.

The data property of the metadata will contain information about each point, bar, etc. depending on the chart type.

Extensive examples of usage are available in the Chart.js tests

.

const meta = myChart.getDatasetMeta(0);
const x = meta.data[0].x;

 

 
        Copied!
    

getVisibleDatasetCount

Returns the number of datasets that are currently not hidden.

const numberOfVisibleDatasets = chart.getVisibleDatasetCount();

 

 
        Copied!
    

setDatasetVisibility(datasetIndex, visibility)

Sets the visibility for a given dataset. This can be used to build a chart legend in HTML. During click on one of the HTML items, you can call setDatasetVisibility to change the appropriate dataset.

chart.setDatasetVisibility(1, false); // hides dataset at index 1
chart.update(); // chart now renders with dataset hidden

 

 
        Copied!
    

toggleDataVisibility(index)

Toggles the visibility of an item in all datasets. A dataset needs to explicitly support this feature for it to have an effect. From internal chart types, doughnut / pie, polar area, and bar use this.

chart.toggleDataVisibility(2); // toggles the item in all datasets, at index 2
chart.update(); // chart now renders with item hidden

 

 
        Copied!
    

getDataVisibility(index)

Returns the stored visibility state of a data index for all datasets. Set by toggleDataVisibility. A dataset controller should use this method to determine if an item should not be visible.

const visible = chart.getDataVisibility(2);

 

 
        Copied!
    

hide(datasetIndex, dataIndex?)

If dataIndex is not specified, sets the visibility for the given dataset to false. Updates the chart and animates the dataset with 'hide' mode. This animation can be configured under the hide key in animation options. Please see animations docs for more details.

If dataIndex is specified, sets the hidden flag of that element to true and updates the chart.

chart.hide(1); // hides dataset at index 1 and does 'hide' animation.
chart.hide(0, 2); // hides the data element at index 2 of the first dataset.

 

 
        Copied!
    

show(datasetIndex, dataIndex?)

If dataIndex is not specified, sets the visibility for the given dataset to true. Updates the chart and animates the dataset with 'show' mode. This animation can be configured under the show key in animation options. Please see animations docs for more details.

If dataIndex is specified, sets the hidden flag of that element to false and updates the chart.

chart.show(1); // shows dataset at index 1 and does 'show' animation.
chart.show(0, 2); // shows the data element at index 2 of the first dataset.

 

 
        Copied!
    

setActiveElements(activeElements)

Sets the active (hovered) elements for the chart. See the "Programmatic Events" sample file to see this in action.

chart.setActiveElements([
    {datasetIndex: 0, index: 1},
]);

 

 
        Copied!
    

isPluginEnabled(pluginId)

Returns a boolean if a plugin with the given ID has been registered to the chart instance.

chart.isPluginEnabled('filler');

 

 
        Copied!
    

Static: getChart(key)

Finds the chart instance from the given key. If the key is a string, it is interpreted as the ID of the Canvas node for the Chart. The key can also be a CanvasRenderingContext2D or an HTMLDOMElement. This will return undefined if no Chart is found. To be found, the chart must have previously been created.

const chart = Chart.getChart("canvas-id");

 

 
        Copied!
    

Static: register(chartComponentLike)

Used to register plugins, axis types or chart types globally to all your charts.

import { Chart, Tooltip, LinearScale, PointElement, BubbleController } from 'chart.js';

Chart.register(Tooltip, LinearScale, PointElement, BubbleController);

 

 
        Copied!
    

Static: unregister(chartComponentLike)

Used to unregister plugins, axis types or chart types globally from all your charts.

New Axes

Axes in Chart.js can be individually extended. Axes should always derive from Chart.Scale but this is not a mandatory requirement.

class MyScale extends Chart.Scale {
    /* extensions ... */
}
MyScale.id = 'myScale';
MyScale.defaults = defaultConfigObject;

// MyScale is now derived from Chart.Scale

 

 
        Copied!
    

Once you have created your scale class, you need to register it with the global chart object so that it can be used.

Chart.register(MyScale);

// If the new scale is not extending Chart.Scale, the prototype can not be used to detect what
// you are trying to register - so you need to be explicit:

// Chart.registry.addScales(MyScale);

 

 
        Copied!
    

To use the new scale, simply pass in the string key to the config when creating a chart.

const lineChart = new Chart(ctx, {
    data: data,
    type: 'line',
    options: {
        scales: {
            y: {
                type: 'myScale' // this is the same id that was set on the scale
            }
        }
    }
});

 

 
        Copied!
    

Scale Properties

Scale instances are given the following properties during the fitting process.

{
    left: number, // left edge of the scale bounding box
    right: number, // right edge of the bounding box
    top: number,
    bottom: number,
    width: number, // the same as right - left
    height: number, // the same as bottom - top

    // Margin on each side. Like css, this is outside the bounding box.
    margins: {
        left: number,
        right: number,
        top: number,
        bottom: number
    },

    // Amount of padding on the inside of the bounding box (like CSS)
    paddingLeft: number,
    paddingRight: number,
    paddingTop: number,
    paddingBottom: number
}

 

 
        Copied!
    

Scale Interface

To work with Chart.js, custom scale types must implement the following interface.

{
    // Determines the data limits. Should set this.min and this.max to be the data max/min
    determineDataLimits: function() {},

    // Generate tick marks. this.chart is the chart instance. The data object can be accessed as this.chart.data
    // buildTicks() should create a ticks array on the axis instance, if you intend to use any of the implementations from the base class
    buildTicks: function() {},

    // Get the label to show for the given value
    getLabelForValue: function(value) {},

    // Get the pixel (x coordinate for horizontal axis, y coordinate for vertical axis) for a given value
    // @param index: index into the ticks array
    getPixelForTick: function(index) {},

    // Get the pixel (x coordinate for horizontal axis, y coordinate for vertical axis) for a given value
    // @param value : the value to get the pixel for
    // @param [index] : index into the data array of the value
    getPixelForValue: function(value, index) {},

    // Get the value for a given pixel (x coordinate for horizontal axis, y coordinate for vertical axis)
    // @param pixel : pixel value
    getValueForPixel: function(pixel) {}
}

 

 
        Copied!
    

Optionally, the following methods may also be overwritten, but an implementation is already provided by the Chart.Scale base class.

{
    // Adds labels to objects in the ticks array. The default implementation simply calls this.options.ticks.callback(numericalTick, index, ticks);
    generateTickLabels: function() {},

    // Determine how much the labels will rotate by. The default implementation will only rotate labels if the scale is horizontal.
    calculateLabelRotation: function() {},

    // Fits the scale into the canvas.
    // this.maxWidth and this.maxHeight will tell you the maximum dimensions the scale instance can be. Scales should endeavour to be as efficient as possible with canvas space.
    // this.margins is the amount of space you have on either side of your scale that you may expand in to. This is used already for calculating the best label rotation
    // You must set this.minSize to be the size of your scale. It must be an object containing 2 properties: width and height.
    // You must set this.width to be the width and this.height to be the height of the scale
    fit: function() {},

    // Draws the scale onto the canvas. this.(left|right|top|bottom) will have been populated to tell you the area on the canvas to draw in
    // @param chartArea : an object containing four properties: left, right, top, bottom. This is the rectangle that lines, bars, etc will be drawn in. It may be used, for example, to draw grid lines.
    draw: function(chartArea) {}
}

 

 
        Copied!
    

The Core.Scale base class also has some utility functions that you may find useful.

{
    // Returns true if the scale instance is horizontal
    isHorizontal: function() {},

    // Returns the scale tick objects ({label, major})
    getTicks: function() {}
}

 

 
 New Charts

Chart.js 2.0 introduced the concept of controllers for each dataset. Like scales, new controllers can be written as needed.

class MyType extends Chart.DatasetController {

}

Chart.register(MyType);

// Now we can create a new instance of our chart, using the Chart.js API
new Chart(ctx, {
    // this is the string the constructor was registered at, ie Chart.controllers.MyType
    type: 'MyType',
    data: data,
    options: options
});

 

 
        Copied!
    

Dataset Controller Interface

Dataset controllers must implement the following interface.

{
    // Defaults for charts of this type
    defaults: {
        // If set to `false` or `null`, no dataset level element is created.
        // If set to a string, this is the type of element to create for the dataset.
        // For example, a line create needs to create a line element so this is the string 'line'
        datasetElementType: string | null | false,

        // If set to `false` or `null`, no elements are created for each data value.
        // If set to a string, this is the type of element to create for each data value.
        // For example, a line create needs to create a point element so this is the string 'point'
        dataElementType: string | null | false,
    }

    // ID of the controller
    id: string;

    // Update the elements in response to new data
    // @param mode : update mode, core calls this method using any of `'active'`, `'hide'`, `'reset'`, `'resize'`, `'show'` or `undefined`
    update: function(mode) {}
}

 

 
        Copied!
    

The following methods may optionally be overridden by derived dataset controllers.

{
    // Draw the representation of the dataset. The base implementation works in most cases, and an example of a derived version
    // can be found in the line controller
    draw: function() {},

    // Initializes the controller
    initialize: function() {},

    // Ensures that the dataset represented by this controller is linked to a scale. Overridden to helpers.noop in the polar area and doughnut controllers as these
    // chart types using a single scale
    linkScales: function() {},

    // Parse the data into the controller meta data. The default implementation will work for cartesian parsing, but an example of an overridden
    // version can be found in the doughnut controller
    parse: function(start, count) {},
}

 

 
        Copied!
    

Extending Existing Chart Types

Extending or replacing an existing controller type is easy. Simply replace the constructor for one of the built-in types with your own.

The built-in controller types are:

    BarController
    BubbleController
    DoughnutController
    LineController
    PieController
    PolarAreaController
    RadarController
    ScatterController

These controllers are also available in the UMD package, directly under Chart. Eg: Chart.BarController.

For example, to derive a new chart type that extends from a bubble chart, you would do the following.

import {BubbleController} from 'chart.js';
class Custom extends BubbleController {
    draw() {
        // Call bubble controller method to draw all the points
        super.draw(arguments);

        // Now we can do some custom drawing for this dataset. Here we'll draw a red box around the first point in each dataset
        const meta = this.getMeta();
        const pt0 = meta.data[0];

        const {x, y} = pt0.getProps(['x', 'y']);
        const {radius} = pt0.options;

        const ctx = this.chart.ctx;
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - radius, y - radius, 2 * radius, 2 * radius);
        ctx.restore();
    }
};
Custom.id = 'derivedBubble';
Custom.defaults = BubbleController.defaults;

// Stores the controller so that the chart initialization routine can look it up
Chart.register(Custom);

// Now we can create and use our new chart type
new Chart(ctx, {
    type: 'derivedBubble',
    data: data,
    options: options
});

 

 
        Copied!
    

TypeScript Typings

If you want your new chart type to be statically typed, you must provide a .d.ts TypeScript declaration file. Chart.js provides a way to augment built-in types with user-defined ones, by using the concept of "declaration merging".

When adding a new chart type, ChartTypeRegistry must contain the declarations for the new type, either by extending an existing entry in ChartTypeRegistry or by creating a new one.

For example, to provide typings for a new chart type that extends from a bubble chart, you would add a .d.ts containing:

import { ChartTypeRegistry } from 'chart.js';

declare module 'chart.js' {
    interface ChartTypeRegistry {
        derivedBubble: ChartTypeRegistry['bubble']
    }
}

 

 
 4.x Migration Guide

Chart.js 4.0 introduces a number of breaking changes. We tried keeping the amount of breaking changes to a minimum. For some features and bug fixes it was necessary to break backwards compatibility, but we aimed to do so only when worth the benefit.
End user migration
Charts

    Charts don't override the default tooltip callbacks, so all chart types have the same-looking tooltips.
    Default scale override has been removed if the configured scale starts with x/y. Defining xAxes in your config will now create a second scale instead of overriding the default x axis.

Options

A number of changes were made to the configuration options passed to the Chart constructor. Those changes are documented below.
Specific changes

    The radialLinear grid indexable and scriptable options don't decrease the index of the specified grid line anymore.
    The destroy plugin hook has been removed and replaced with afterDestroy.
    Ticks callback on time scale now receives timestamp instead of a formatted label.
    scales[id].grid.drawBorder has been renamed to scales[id].border.display.
    scales[id].grid.borderWidth has been renamed to scales[id].border.width.
    scales[id].grid.borderColor has been renamed to scales[id].border.color.
    scales[id].grid.borderDash has been renamed to scales[id].border.dash.
    scales[id].grid.borderDashOffset has been renamed to scales[id].border.dashOffset.
    The z index for the border of a scale is now configurable instead of being 1 higher as the grid z index.
    Linear scales now add and subtracts 5% of the max value to the range if the min and max are the same instead of 1.
    If the tooltip callback returns undefined, then the default callback will be used.
    maintainAspectRatio respects container height.
    Time and timeseries scales use ticks.stepSize instead of time.stepSize, which has been removed.
    maxTickslimit won't be used for the ticks in autoSkip if the determined max ticks is less then the maxTicksLimit.
    dist/chart.js has been removed.
    dist/chart.min.js has been renamed to dist/chart.umd.js.
    dist/chart.esm.js has been renamed to dist/chart.js.

Type changes

    The order of the ChartMeta parameters have been changed from <Element, DatasetElement, Type> to <Type, Element, DatasetElement>.

General

    Chart.js becomes an ESM-only package

(the UMD bundle is still available). To use Chart.js, your project should also be an ES module. Make sure to have this in your package.json:

{
  "type": "module"
}

 

 
        Copied!
    

If you are experiencing problems with Jest , follow its documentation to enable the ESM support. Or, we can recommend you migrating to Vitest . Vitest has the ESM support out of the box and almost the same API as Jest . See an example of migration
.
Removed fallback to fontColor for the legend text and strikethrough color.
Removed config._chart fallback for this.chart in the filler plugin.
Removed this._chart in the filler plugin.

