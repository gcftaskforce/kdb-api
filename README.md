# GCF Task Force Knowledge Database (API Component)

## Project Overview

The GCF Task Force Knowledge Database (KDB) consists of three components:

1. a database API
2. an MVC-style website
3. a custom client-based (Webpack/babel compiled) content management system (CMS) inline with the website.

Both he API and website are Node JS (ES 6) Express applications proxied through Apache. PM2 is used to manage the two (API and site) processes. Everything runs on a virtual machine hosted on Google Cloud.

Note that all application-related files are stored on a separately requisitioned disk mounted at /data.

Google Cloud Datastore serves as the backend database. However, the API is the only component that interacts directly with the database.

Redis is used to store session state for authentication. Session state is shared between API and website components.

Directory structure is consistent between the two applications. Configuration files are maintained in ./etc. Configurations are read once at startup thus necessitating application restart (through PM2) to incorporate any changes. The files in ./etc specify seldom-changed attributes.

All code is linted against [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb).

### Custom Data Types

The custom data types fulfilling the requirements of the KDB (and reflected in the API's models/ directory) are summarized below. Please see individual model classes in the API for specifics.

- **Value** consists of a numeric "amount" attribute as well as "year" and "currency" (string) attributes acting as modifiers. In order to maintain compatibility with JSON as well as Google Cloud Datastore, *null* is used as a missing value. Note that the API returns a formatted "string" attribute, but this is derived (not stored in the Datastore). See each corresponding class defined in ./models in the API for insight on derived attributes.
- **Array** consists of an array-type property "rows", each row containing an "id" and an "amount" (see "Value" above) attribute.
- **Text** *self explanatory*
- **Framework** structured exactly as Text. The datatype was made separate in anticipation of extracting the current textual content into more structured attributes.
- **Contact** consists of (string) attributes "firstName", "lastName", "email", and "companyTitle"
- **Partnership** consists of the text attributes "name", "link", "description", "fundingSource", "fundingAmount", "initiativeType", "initiativeStatus" and "partners". The attribute "jurisdictions" maintains a string array of jurisdiction ids. This field is used for display as well as filtering Partnership records to be properly included in either the context of a nation or jurisdiction.

### Multilingual Features

Both the API and website components are multilingual. Specific label translations are maintained under ./etc.

Text translations (text data) are discussed in the API Component README.

### Data Slugs

The KDB is principally a repository for data at both the nation and jurisdictional level. Collectively these are referred to as "regions". Identifiers are referenced in snake case with a dot separator as follows (note the removal of combining diacritical marks to form strict ASCII string IDs). For example:

- "mexico" identifies the nation of Mexico
- "brazil.maranhao" identifies the jurisdiction of Maranhão, Brazil

## API

### Environment

The following environment variables are required:

- **PORT** HTTP port the API is run on
- **SESSION_NAME** name of session used for authenticated users
- **SESSION_SECRET** key (salt) for the session
- **GOOGLE_PROJECT_ID** *self explanatory*
- **GOOGLE_APPLICATION_CREDENTIALS** absolute path to Google-generated JSON file

### API Component Routes

The API routes are grouped into public and private. Please see the app for details, but to summarize:

- The public routes are strictly GET and prefixed by '/json'.
- The private routes are strictly POST.

### Categorical Data

### Citations

Citation text (HTML) is stored as a single text attribute for each entity of type _Value_, _Array_, _Text_, and _Framework_ (_Partnership_ and _Contact_ types are not cited).

Citations are not translated.

For convenience, the models use an updateCitation() method available through the POST API.

### Derived Values and Summary Data

Please refer to the configuration file [etc/field-defs.js](etc/field-defs.js) and the module [summary-data.js](summary-data.js). Field definitions based on derived values must have an ``isDerived`` property set to ``true`` and a ``get`` property specifying a callback having a single argument (the ``context``).

The calculations are performed in the module [summary-data.js](summary-data.js). The ``context`` is really a closure providing access to all the required "dependent variables" for calculations at the national or jurisdictional level (and they are different!).

Several jurisdictional calculations require access to values from the member nation. These are included in the ``context``.

The ``context`` also includes the global data defined in the configuration file [etc/global-data.js](etc/global-data.js).

Following the calculation of all derived values for all nations/jurisdictions, summary-totals are calculated. These are displayed on the website homepage.

Note that the [summary-data.js](summary-data.js) module includes a ``get()`` and a ``save()`` method.

``get()`` retrieves all the necessary Datastore entities, performs the calculations, and returns an array of results.

``save(summaryData)`` updates all derived values in the Datastore (currently ``Value`` types only).

The API updates the variable ``SUMMARY_DATA`` upon startup so that this data will be available to the public route '/json/summary-data.json'.

Additionally, changes to ``Value`` or ``Array`` types trigger a call to ``summaryData.get()`` and ``summaryData.save()`` both to update the variable ``SUMMARY_DATA`` and save the calculations to the Datastore. This is performed through the 'updateEntity' POST route.

TODO: use Redis instead of the module-level variable ``SUMMARY_DATA``.

### Translated Content

### Basic Directory Structure

- etc/ data files
  - fields/ field definitions (by field type)
  - regions/ region definitions by nation then jurisdiction
- lib/ common support functions
- models/ classes for interacting with the database (by field type)

### Routing
