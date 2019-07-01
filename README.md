# GCF Task Force Knowledge Database (API Component)

## Project Overview

The GCF Task Force Knowledge Database (KDB) consists of three components: (1) a database API; (2) an MVC-style website; and (3) a custom client-based (Webpack/babel compiled) inline content management system (CMS).

The API and website are Node JS (ES 6) Express applications accessed through Apache proxy. PM2 is used to manage the two (API and site) processes. Everything runs on a virtual machine hosted on Google Cloud.

Note that all application-related files are stored on a separately requisitioned disk mounted at /data.

Google Cloud Datastore serves as the backend database. Note that the API is the only component that interacts directly with the database.

Redis is used to store session state for authentication. Session state is shared between API and website components.

Directory structure is consistent between the two applications. Configuration files are maintained in ./etc. Configurations are read once at startup thus necessitating application restart (through PM2) to incorporate any changes. The files in ./etc specify seldom-changed attributes.

### Custom Data Types

The custom data types fulfilling the requirements of the KDB (and reflected in the API's models/ directory) are are summarized below. Please see individual model classes in the API for specifics.

- Value: consists of a numeric "amount" attribute as well as "year" and "currency" (string) attributes acting as modifiers. In order to maintain compatibility with JSON as well as Google Cloud Datastore, null is used as a missing value. Note that the API returns a formatted "string" attribute, but this is derived (not stored in the Datastore). See each corresponding class defined in ./models in the API for insight on derived attributes.

- Array: consists of an array-type property "rows", each row containing an "id" and an "amount" (see "Value" above) attribute.

- Text: self explanatory.

- Framework: structured exactly as Text. The datatype was made separate in anticipation of extracting the current textual content into more structured attributes.

- Contact: consists of (string) attributes "firstName", "lastName", "email", and "companyTitle"

- Partnership: consists of the text attributes "name", "link", "description", "fundingSource", "fundingAmount", "initiativeType", "initiativeStatus". One attribute, "partners", is stored as text but delimited for possible future use as a list. Finally, the attribute "jurisdictions" maintains a string array of jurisdiction ids. This field is used for display as well as filtering Partnership records to be properly included in either the context of a nation or jurisdiction.

### Multilingual Features

Both the API and website components are multilingual. Specific label translations are maintained under ./etc.

Text translations (text data) are discussed in the API Component README.

The KDB is principally a repository for data at both the nation and jurisdictional level. Collectively these are referred to as "regions". Identifiers are referenced in snake case with a dot separator as follows (note the removal of combining diacritical marks). For example:

- "mexico" identifies the nation of Mexico
- "brazil.maranhao" identifies the jurisdiction of Maranhão, Brazil

## API

### API Component Routes

The API routes are grouped into public and private. Please see the app for details, but to summarize:

- The public routes are strictly GET and prefixed by '/json'.
- The private routes are strictly POST.

## Server Requirements (Including Development Environments)

- installed and running Redis server
- .env file specifying the following (example values given):
  - DEBUG=api:*
  - DEBUG_DEPTH=10
  - PORT=3001

## Categorical Data

## Citations

## Summary Data and Derived Values

## Translated Content

## Basic Directory Structure

- etc/ data files
  - fields/ field definitions (by field type)
  - regions/ region definitions by nation then jurisdiction
- lib/ common support functions
- models/ classes for interacting with the database (by field type)

## Routing

http://localhost:3001/json/regionDefs
http://localhost:3001/json/partnership-brazil.acre-en.json

