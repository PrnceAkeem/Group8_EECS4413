// sortStrategies.js — Strategy Pattern (GoF Behavioral)
//
// The Strategy pattern defines a family of algorithms (sorting rules),
// encapsulates each one, and makes them interchangeable.
//
// In the course warehouse lab, you saw strategies used to swap out processing
// behaviour at runtime without touching calling code. Same idea here:
// the CatalogPage dropdown just maps over SORT_STRATEGIES — it doesn't care
// HOW sorting works, only WHICH strategy is selected.
//
// Each strategy object has:
//   key   — the query param value sent to the API  (matches SORT_MAP in ProductDAO.js)
//   label — the human-readable text shown in the dropdown

export const SORT_STRATEGIES = [
  { key: 'price_asc',  label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'name_asc',   label: 'Name: A to Z'       },
  { key: 'name_desc',  label: 'Name: Z to A'       }
];
