# GCF Task Force Knowledge Database (API Component)

## Project Overview

The GCF Task Force Knowledge Database (KDB) consists of three components:

1. a database API
2. an MVC-style website
3. a custom client-based (Webpack/babel compiled) content management system (CMS) inline with the website.

Both the API and website components are built on the following stack.

- Node JS (ES 6)
- Apache
- Express proxied through Apache
- PM2

Everything runs on a Debian virtual machine instance hosted on Google Cloud.

Note that the applications (*kdb-api* and *kdb-site*) as well as the configuration files are stored on a separately requisitioned disk mounted at ``/mnt/disks/data``.

Google Cloud [Datastore](https://cloud.google.com/datastore/) serves as the backend database. The API is the only component that interacts directly with the database.

Redis is used to store session state for authentication. Session state is shared between API and website components.

Directory structure is consistent between the two applications. Configuration files are maintained in ./etc. Configurations are read once at startup thus necessitating application restart (through PM2) to incorporate any changes. The files in ./etc specify seldom-changed attributes.

All code is linted against [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb).

### Custom Data Types (Kinds)

The custom data types (Kinds) fulfilling the requirements of the KDB (and reflected in the API's models/ directory) are summarized below. Please see individual model classes in the API for specifics.

- **Value** consists of a numeric "amount" attribute as well as "year" and "currency" (string) attributes acting as modifiers. In order to maintain compatibility with JSON as well as Google Cloud Datastore, *null* is used as a missing value. Note that the API returns a formatted "string" attribute, but this is derived (not stored in the Datastore). See each corresponding class defined in ./models in the API for insight on derived attributes.
- **Array** consists of an array-type property "rows", each row containing an "id" and an "amount" (see "Value" above) attribute.
- **Text** *self explanatory*
- **Framework** structured exactly as Text. The datatype was made separate in anticipation of extracting the current textual content into more structured attributes.
- **Contact** consists of (string) attributes "firstName", "lastName", "email", and "companyTitle"
- **Partnership** consists of the text attributes "name", "link", "description", "fundingSource", "fundingAmount", "initiativeType", "initiativeStatus" and "partners". The attribute "jurisdictions" maintains a string array of jurisdiction ids. This field is used for display as well as filtering Partnership records to be properly included in either the context of a nation or jurisdiction.

### Multilingual Features

Both the API and website components are multilingual. Specific label translations are maintained under ./etc.

Text translations (text data) are discussed in the API Component README.

### Region Ids/Slugs

The KDB is principally a repository for data at both the nation and jurisdictional level. Collectively these are referred to as "regions". Identifiers are referenced in snake case with a dot-separator as follows (note the removal of combining diacritical marks to form strict ASCII string IDs). For example:

- "mexico" identifies the nation of Mexico
- "brazil.maranhao" identifies the jurisdiction of Maranhão, Brazil

Internally these are referred to as ``regionId``.

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

For convenience, public routes are grouped into *collection*s. The *data" collection includes *value*, *array*, *contact*, and *text* types. The collections *frameworks* and *partnerships* simply return their respective types.

### Google Cloud Datastore Nomenclature and Integration

Please refer to [Datastore overview](https://cloud.google.com/datastore/docs/concepts/overview). Google Cloud Datastore is a schemaless database. It is up to the developer to enforce structure and organization through design using Google Cloud Datastore organizational concepts *Kind*, *Entity*, and *Property*.

An Object stored in Google Cloud Datastore is referred to as *Entity*, with each individual data for the object referred to as *Property*.

Each of the KDB's custom datatypes corresponds to a *Kind*. Furthermore, each *Kind* corresponds to its own model as defined in [models](models/).

Within the KDB, each *Entity* is uniquely identified (keyed) following the convention ``kind-fieldName-regionId`` (``array-forest_management-peru.san_martin`` for example).

### Data Fields and Templates

All KDB *Kinds* (and by extension  [models](models/)) **except** the "Partnership" *Kind* use a data templating system.

All data fields are defined in [etc/field-defs.js](etc/field-defs.js).

Each record returned by the [models](models/__Model.js) class methods ``filter()`` ``find()`` is in actuality a clone of its corresponding field definition in [etc/field-defs.js](etc/field-defs.js) with properties from the corresponding Datastore *Entity* merged in.

For example, records returned by a call to ``filter('peru.san_martin', 'es')``on the *Array* model will include a record ``array-forest_management-peru.san_martin``. This record will include relevant "forest_management" properties (Spanish version of "label", "units", etc) from the [etc/field-defs.js](etc/field-defs.js) with the actual data for "peru.san_martin" merged in. This actual data would include the properties "rows", "citation", "timestamp".

The "Partnership" *Kind* does not use this templating system.

#### Categorical Data and Field Overrides

As described above, all data fields are defined in [etc/field-defs.js](etc/field-defs.js).

However, specific field properties may be optionally defined by a member region (national or jurisdictional).

This is commonly the case with categorical data (of the *Array* kind). Categories for the "Forest Management" field, for example, are normally defined by the jurisdiction itself.

These *overrides* are defined by each member region in [etc/regions](etc/regions).

Furthermore, categories for a jurisdictional field are often dictated at the national level, resulting in consistency across all jurisdictions within that nation. To accommodate this scenario, the structure of [etc/regions](etc/regions) allows for a ``jurisdictional-fields.js`` definition file within each "nation" directory.

For example, all jurisdictions in Peru use common "Forest Management" categories. These are defined in [etc/regions/peru/jurisdictional-fields.js](etc/regions/peru/jurisdictional-fields.js).

Individual jurisdictions, San Martín for example, can specify their own field-definition properties [etc/regions/peru/jurisdictions/san_martin/index.js](etc/regions/peru/jurisdictions/san_martin/index.js).

### Partnerships

As discussed above, the "Partnership" *Kind* does not use a templating system built from [etc/field-defs.js](etc/field-defs.js). "Partnerships" can be thought of more as an array.

"Partnerships" also differ from other KDB data in that each partnership *Entity* maintains a ``nationId`` along with a``jurisdictions`` array. Thus, a single "Partnership" can be cross listed within a nation and multiple jurisdictions. For example

The "Partnership" *Amazon's Nectar* with the ID "partnership.jsnc3bx0-brazil-jsnc3bx0" has a ``nationID`` of ``"brazil"`` and a ``jurisdictions`` of ``["amapa", "para"]``.

See the [models/Partnership.js](models/Partnership.js) class for insight into how this works.

### Citations

Citation text (HTML) is stored as a single text attribute for each entity of type _Value_, _Array_, _Text_, and _Framework_ (_Partnership_ and _Contact_ kinds are not cited).

Citations are not translated.

For convenience, the models use an ``updateCitation()`` method available through the POST API.

### Derived (Calculated) Values and Summary Data

Please refer to the configuration file [etc/field-defs.js](etc/field-defs.js) and the module [summary-data.js](summary-data.js). Field definitions based on derived values must have an ``isDerived`` property set to ``true`` and a ``get`` property specifying a callback function having a single argument (the ``context``).

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

### Derived Entity Properties

*Derived Entity Properties* are defined at the model [models/](models/) level and should not be confused with *Derived Values*.

To recap from the subsection *Derived (Calculated) Values and Summary Data* above, **derived values** are actual stored Datastore entities that must be calculated using other data.

The **derived entity properties** are, on the other hand, *Entity* properties derived from *Entity* properties stored in the Datastore.

For illustration, refer to the ``fullName`` derived property in [models/Contact](models/Contact.js). Note that a function callback is specified using ``get``. The ``context`` argument of the callback will have access to both the *Entity* value properties as well as the field definition as specified in [/etc/field-defs.js](/etc/field-defs.js).

### Translated Content

Per client specification, all text fields must be stored and available in all supported languages. Supported languages are specified in the array [etc/langs.js](etc/langs.js).

To accommodate this requirement, models including translated properties support an ```updateTranslation()`` method.

#### Google Translation

Per client specification, all text fields must be capable of being Google translated **from** both English and the native language **into** all other supported languages.

### Timestamps

Timestamps are ISO 8601 *date and time* strings.

`Array`, `Contact`, and `Value` kinds simply store the string in a `timestamp` property.

Translated kinds (`Text` and `Framework`) as well as the `Partnership` kind instead use a `timestamps` array, with additional tilde-delimited (~) segments specifying respectively `propertyName`, `language`, `modifier` where

- `propertyName` refers to the property to which the timestamp applies
- `language` (optional) is the ISO-639-1 lang code of the translation
- `modifier` (optional) any additional information about the translation (at this time only *google* is used)

The following illustrates a `timestamps` array for a `Text` kind.

```javascript
[
  "2018-09-05T14:04:03.556Z~text~id",
  "2018-09-05T14:03:59.821Z~text~fr",
  "2018-06-15T17:22:48.741Z~text~pt",
  "2018-06-12T18:06:52.039Z~text~en",
  "2018-02-06T17:05:08.650Z~text~es~google",
]
```

The following illustrates a `timestamps` array for a `Partnership` kind.

```javascript
[
  "2018-06-15T18:28:39.321Z~partners~pt",
  "2018-06-15T18:28:39.321Z~name~pt",
  "2018-06-15T18:28:39.321Z~jurisdictions",
  "2018-06-15T18:28:39.321Z~initiativeType~pt",
  "2018-06-15T18:28:39.321Z~initiativeStatus~pt",
  "2018-06-15T18:28:39.321Z~description~pt",
  "2018-02-06T17:05:08.751Z~partners~id~google",
  "2018-02-06T17:05:08.751Z~name~id~google",
  "2018-02-06T17:05:08.751Z~initiativeType~id~google",
  "2018-02-06T17:05:08.751Z~initiativeStatus~id~google",
  "2018-02-06T17:05:08.751Z~description~id~google",
  "2018-02-06T17:05:08.650Z~partners~es~google",
  "2018-02-06T17:05:08.650Z~name~es~google",
  "2018-02-06T17:05:08.650Z~initiativeType~es~google",
  "2018-02-06T17:05:08.650Z~initiativeStatus~es~google",
  "2018-02-06T17:05:08.650Z~description~es~google",
  "2017-10-31T17:03:20.873Z~partners~en",
  "2017-10-31T17:03:20.873Z~name~en",
  "2017-10-31T17:03:20.873Z~initiativeType~en",
  "2017-10-31T17:03:20.873Z~initiativeStatus~en",
  "2017-10-31T17:03:20.873Z~description~en",
]
```

Note that for *Partnerships*, the capability to edit/translate individual properties was added later. Earlier, all properties were submitted in the same form, resulting in shared ISO 8601 *date and time* strings.

### Basic Directory Structure


### Routing
