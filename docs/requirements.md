# Simple Sales Notifications - Requirements

Tài liệu này tóm tắt yêu cầu chính cho project Simple Sales Notifications theo Roadmap trong spec Avada Final Exam. Mục tiêu là có một source-of-truth nội bộ để implement, demo và review với mentor.

## 1. Mục Tiêu Sản Phẩm

Simple Sales Notifications là Shopify app giúp merchant hiển thị popup thông báo đơn hàng gần đây trên storefront. Merchant cấu hình cách popup hiển thị trong embedded admin app, còn storefront script sẽ lấy cấu hình và danh sách notifications từ backend để render popup cho khách hàng.

Phạm vi chính:

- Embedded admin UI để merchant cấu hình popup.
- Firestore data model cho settings và notifications.
- Admin APIs cho settings và notifications.
- Installation logic để tạo default settings và sync recent orders.
- Shopify webhook để tạo notification khi có order mới.
- Public client API cho storefront script.
- Storefront JavaScript SDK hoặc theme app extension để hiển thị popup.

## 2. Merchant Admin UI

Settings page trong `packages/assets` phải dùng Shopify Polaris cho form và layout. Form chỉ nên dùng custom CSS khi Polaris không đáp ứng được yêu cầu visual.

Yêu cầu UI:

- Hiển thị form cấu hình popup theo settings schema.
- Hiển thị preview popup bằng reusable React component.
- Dùng `useFetchApi` để load settings từ `/api/settings`.
- Dùng API update để save settings qua `PUT /api/settings`.
- Có loading state khi load/save.
- Có toast hoặc error feedback khi save thành công/thất bại.

Fields cần cấu hình:

| Field | Type | Accepted values | Description |
| --- | --- | --- | --- |
| `position` | string | `bottom-left`, `bottom-right`, `top-left`, `top-right` | Vị trí hiển thị popup trên storefront |
| `hideTimeAgo` | boolean | `true`, `false` | Ẩn/hiện thời gian mua hàng |
| `truncateProductName` | boolean | `true`, `false` | Cắt ngắn product name khi quá dài |
| `displayDuration` | number | integer seconds | Thời gian mỗi popup được hiển thị |
| `firstDelay` | number | integer seconds | Thời gian chờ trước popup đầu tiên |
| `popsInterval` | number | integer seconds | Khoảng cách giữa các popup |
| `maxPopsDisplay` | number | integer | Số popup tối đa trong mỗi page load |
| `includedUrls` | string | newline-separated URLs | Danh sách URL được phép hiển thị popup |
| `excludedUrls` | string | newline-separated URLs | Danh sách URL không được hiển thị popup |
| `allowShow` | string | `all`, `specific` | Hiển thị trên tất cả trang hoặc chỉ trang cụ thể |

## 3. Firestore Schema

Ngoài các collection có sẵn từ Avada Core như `shopInfos`, `shops`, `subscriptions`, app cần thêm hai collection riêng.

### `settings`

Lưu cấu hình popup của từng shop. Mỗi setting bắt buộc phải scope theo `shopId`.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `shopId` | string | yes | Firestore ID của shop |
| `position` | string | yes | Vị trí popup |
| `hideTimeAgo` | boolean | yes | Ẩn/hiện time ago |
| `truncateProductName` | boolean | yes | Cắt ngắn tên sản phẩm |
| `displayDuration` | number | yes | Số giây hiển thị mỗi popup |
| `firstDelay` | number | yes | Số giây delay trước popup đầu |
| `popsInterval` | number | yes | Số giây giữa các popup |
| `maxPopsDisplay` | number | yes | Số popup tối đa mỗi page load |
| `includedUrls` | string | no | URL allow-list, phân cách bằng xuống dòng |
| `excludedUrls` | string | no | URL deny-list, phân cách bằng xuống dòng |
| `allowShow` | string | yes | `all` hoặc `specific` |
| `createdAt` | Date | yes | Thời điểm tạo |
| `updatedAt` | Date | yes | Thời điểm cập nhật |

Default setting nên được tạo sau khi install app nếu shop chưa có setting.

### `notifications`

Lưu danh sách sales notifications được tạo từ Shopify orders. Mỗi notification bắt buộc phải scope theo `shopId`.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `shopId` | string | yes | Firestore ID của shop |
| `firstName` | string | no | Customer first name |
| `city` | string | no | Customer city |
| `country` | string | no | Customer country |
| `productName` | string | yes | Tên sản phẩm đã mua |
| `productId` | number | no | Shopify product ID |
| `timestamp` | Date | yes | Thời điểm order |
| `productImage` | string | no | Link ảnh sản phẩm |
| `orderId` | number/string | recommended | Shopify order ID để tránh duplicate |
| `createdAt` | Date | yes | Thời điểm tạo notification |

## 4. Admin API Requirements

Admin APIs nằm trong `packages/functions/src/routes/api.js` và phải lấy shop hiện tại từ session/auth context. Tất cả query/write phải scope theo `shopId`.

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/settings` | Lấy setting của shop hiện tại. Nếu chưa có, trả default setting hoặc tạo default setting. |
| `PUT` | `/api/settings` | Validate và cập nhật setting của shop hiện tại. |
| `GET` | `/api/notifications` | Lấy danh sách notifications của shop hiện tại, sắp xếp mới nhất trước. |

Response nên theo format hiện có của boilerplate:

```json
{
  "success": true,
  "data": {}
}
```

Khi lỗi:

```json
{
  "success": false,
  "error": "Error message"
}
```

## 5. Installation Logic

Sau khi app được install hoặc login thành công, backend cần chạy logic khởi tạo cho shop.

Yêu cầu:

- Tạo default setting cho shop nếu chưa tồn tại.
- Sync tối đa 30 orders gần nhất từ Shopify vào `notifications`.
- Dùng chung một mapper Shopify order -> notification với webhook order-created.
- Tránh tạo duplicate notifications khi install/login chạy lại.
- Xử lý async rõ ràng, không để install flow fail im lặng nếu sync order bị lỗi.

Default values nên hợp lý cho demo:

| Field | Default |
| --- | --- |
| `position` | `bottom-left` |
| `hideTimeAgo` | `false` |
| `truncateProductName` | `true` |
| `displayDuration` | `5` |
| `firstDelay` | `3` |
| `popsInterval` | `5` |
| `maxPopsDisplay` | `20` |
| `includedUrls` | empty string |
| `excludedUrls` | empty string |
| `allowShow` | `all` |

## 6. Webhook Requirements

App cần register Shopify order-created webhook sau khi install. Webhook endpoint nằm trong `packages/functions/src/routes/webhook.js` và phải được verify HMAC bằng middleware hiện có.

Yêu cầu:

- Register webhook với Cloudflare/app base URL hiện tại.
- Thêm route xử lý order-created webhook, ví dụ `/webhook/order-created`.
- Lấy shop domain từ Shopify webhook header.
- Tìm shop trong Firestore bằng Shopify domain.
- Map order payload thành notification và ghi vào `notifications`.
- Dùng chung mapper với installation order sync.
- Tránh duplicate theo `orderId` nếu Shopify retry webhook.
- Trả response nhanh, không để Shopify timeout.

## 7. Public Client API

Public API được storefront script gọi không dùng admin session. Endpoint nằm trong `packages/functions/src/routes/clientApi.js`.

Yêu cầu:

- Nhận `shopifyDomain` từ query string.
- Tìm shop theo `shopifyDomain`.
- Trả về setting và notifications của shop đó.
- Chỉ trả các field cần cho storefront render popup.
- Bật CORS nếu storefront gọi cross-origin.

Response mẫu:

```json
{
  "success": true,
  "data": {
    "setting": {
      "position": "top-left",
      "hideTimeAgo": true,
      "truncateProductName": true,
      "displayDuration": 5,
      "firstDelay": 3,
      "popsInterval": 5,
      "maxPopsDisplay": 20,
      "includedUrls": "",
      "excludedUrls": "",
      "allowShow": "all"
    },
    "notifications": [
      {
        "id": "notification-id",
        "firstName": "John",
        "city": "Hanoi",
        "country": "Vietnam",
        "productName": "Product name",
        "productId": 123456789,
        "productImage": "https://example.com/product.jpg",
        "timestamp": "2026-05-19T00:00:00.000Z"
      }
    ]
  }
}
```

## 8. Storefront Popup Behavior

Storefront display logic nằm trong `packages/scripttag` hoặc theme app extension trong `extensions/theme-extension`.

Yêu cầu runtime:

- Load script async để không block storefront.
- Lấy `window.Shopify.shop` làm shop domain.
- Fetch public client API để lấy setting và notifications.
- Nếu không có setting hoặc notifications thì không render popup.
- Kiểm tra URL rules trước khi hiển thị:
  - `allowShow = all`: hiển thị trên tất cả trang trừ excluded URLs.
  - `allowShow = specific`: chỉ hiển thị trên included URLs và không hiển thị trên excluded URLs.
- Chờ `firstDelay` giây trước popup đầu tiên.
- Hiển thị từng notification theo thứ tự dữ liệu trả về.
- Mỗi popup hiển thị trong `displayDuration` giây.
- Chờ `popsInterval` giây giữa các popup.
- Dừng lại khi đạt `maxPopsDisplay` hoặc hết notifications.
- Áp dụng `position` vào CSS class/style.
- Nếu `hideTimeAgo = true`, ẩn dòng time ago.
- Nếu `truncateProductName = true`, cắt ngắn product name khi quá dài.
- Không dùng nested callback timeout phức tạp; ưu tiên async/await với helper delay.

## 9. Demo Acceptance Checklist

Trước khi demo mentor, cần pass các điểm sau:

- Settings page dùng Polaris, load/save được settings thật.
- Preview popup trong admin gần giống design sales notification.
- Firestore có `settings` và `notifications` đúng schema, có `shopId`.
- Install app tạo default setting và sync tối đa 30 recent orders.
- Tạo order mới trên dev store sẽ sinh notification mới qua webhook.
- Public client API trả về setting và notifications theo `shopifyDomain`.
- Storefront hiển thị popup đúng position, delay, interval, duration và max count.
- URL include/exclude rules hoạt động.
- Product name truncation và hide time ago hoạt động.
- Build production cho assets, functions và scripttag không lỗi.
- README/deploy notes được cập nhật sau khi implementation hoàn tất.

## 10. Out Of Scope Cho Requirements Doc Này

- Không mô tả chi tiết từng file implementation.
- Không thay thế README setup/deploy.
- Không yêu cầu thêm collection `salesPopEvents` vì project ưu tiên Roadmap chính với `settings` và `notifications`.
- Không yêu cầu UI design vượt ngoài mockup/spec của bài final exam.
