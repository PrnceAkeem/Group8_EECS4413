# Catalog API Contract

Base URL: `/api/catalog`

---

## GET /api/catalog

Returns a list of products. All query params are optional and combinable.

### Query Parameters

| Param      | Type   | Description                                          | Example              |
|------------|--------|------------------------------------------------------|----------------------|
| `brand`    | string | Filter by brand name (case-insensitive, exact match) | `?brand=Nike`        |
| `category` | string | Filter by category name (case-insensitive)           | `?category=Lifestyle`|
| `q`        | string | Keyword search against name and description (ILIKE)  | `?q=air+max`         |
| `sort`     | string | Sort order — see allowed values below                | `?sort=price_asc`    |

**Allowed `sort` values:**

| Value        | Meaning              |
|--------------|----------------------|
| `price_asc`  | Price low → high     |
| `price_desc` | Price high → low     |
| `name_asc`   | Name A → Z           |
| `name_desc`  | Name Z → A           |

Any other `sort` value → `400`.

### Success Response `200`

```json
{
  "products": [
    {
      "product_id": "SNK-NIKE-AF1",
      "name": "Nike Air Force 1 Low",
      "brand": "Nike",
      "category": "Lifestyle",
      "colorway": "White / White",
      "price_cents": 13000,
      "inventory_quantity": 40,
      "size_range": "US 6-14",
      "image_url": "https://placehold.co/600x400?text=Air+Force+1"
    }
  ]
}
```

---

## GET /api/catalog/:id

Returns a single product by `product_id`.

### URL Parameter

| Param | Type   | Description                     |
|-------|--------|---------------------------------|
| `id`  | string | The `product_id` (e.g. `SNK-NIKE-AF1`) |

### Success Response `200`

```json
{
  "product": {
    "product_id": "SNK-NIKE-AF1",
    "name": "Nike Air Force 1 Low",
    "model": "Air Force 1",
    "brand": "Nike",
    "category": "Lifestyle",
    "description": "The original basketball shoe turned streetwear staple.",
    "colorway": "White / White",
    "price_cents": 13000,
    "inventory_quantity": 40,
    "release_year": 2024,
    "size_range": "US 6-14",
    "image_url": "https://placehold.co/600x400?text=Air+Force+1"
  }
}
```

---

## Error Shapes

### 400 Bad Request

Returned when a query param has an invalid value (e.g. unknown `sort`).

```json
{
  "error": "invalid_param",
  "message": "sort must be one of: price_asc, price_desc, name_asc, name_desc"
}
```

### 404 Not Found

Returned when `:id` does not match any product.

```json
{
  "error": "not_found",
  "message": "Product SNK-FAKE-ID not found"
}
```

### 500 Internal Server Error

Returned on unexpected database or server failures.

```json
{
  "error": "server_error",
  "message": "An unexpected error occurred"
}
```
