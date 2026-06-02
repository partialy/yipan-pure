# 个人网盘系统第一阶段 - 后端接口草案 (API Documentation Draft)

本文档定义了个人网盘系统各模块的后端接口格式规范。所有接口在第一阶段由前端服务层和 Mocks 系统进行本地模拟（具有 Promise 延迟和存储状态持久化），以便和后续真实后端无缝对接。

## 统一响应格式 (Standard Response Format)

所有接口的 HTTP 响应体都遵循以下标准 JSON 格式：

```typescript
export interface ApiResponse<T> {
  code: number         // 业务状态码，0 表示成功，非 0 表示各类具体错误
  msg: string          // 用户可读提示信息（主要用于前端 Toast/提示）
  data: T              // 接口返回的实际业务对象或数据列表
  success: boolean     // 快捷判断是否成功 (true/false)
  errorMsg?: string    // 详细的排查/错误堆栈信息（生产环境可不返回）
}
```

---

## 1. 认证接口 (Authentication API)

### 1.1 登录账号
* **请求方法**: `POST`
* **请求路径**: `/api/auth/login`
* **请求参数 (JSON)**:
  ```json
  {
    "username": "user_or_email",
    "password": "secure_password"
  }
  ```
* **响应数据型 (`data`)**:
  ```json
  {
    "token": "mock_jwt_token_xxxxx",
    "user": {
      "id": "u-12345",
      "username": "John Doe",
      "email": "user@example.com",
      "avatar": "https://api.dicebear.com/7.x/identicon/svg?seed=John"
    }
  }
  ```
* **异常返回样例**:
  ```json
  {
    "code": 40001,
    "msg": "账号或密码错误",
    "data": null,
    "success": false,
    "errorMsg": "Invalid credentials in authService"
  }
  ```
* **是否需要登录**: 否

### 1.2 注册账号
* **请求方法**: `POST`
* **请求路径**: `/api/auth/register`
* **请求参数 (JSON)**:
  ```json
  {
    "username": "NewUser",
    "email": "new@example.com",
    "password": "secure_password"
  }
  ```
* **响应数据型 (`data`)**:
  ```json
  {
    "id": "u-67890",
    "username": "NewUser",
    "email": "new@example.com"
  }
  ```
* **异常返回样例**:
  ```json
  {
    "code": 40002,
    "msg": "该电子邮箱已被注册",
    "data": null,
    "success": false,
    "errorMsg": "Email already exists in system"
  }
  ```
* **是否需要登录**: 否

### 1.3 退出登录
* **请求方法**: `POST`
* **请求路径**: `/api/auth/logout`
* **请求参数**: 无
* **响应数据型 (`data`)**: `null` (或 `"ok"`)
* **是否需要登录**: 是

### 1.4 获取当前登录用户信息
* **请求方法**: `GET`
* **请求路径**: `/api/auth/me`
* **Headers**: `Authorization: Bearer <token>`
* **请求参数**: 无
* **响应数据型 (`data`)**:
  ```json
  {
    "id": "u-12345",
    "username": "John Doe",
    "email": "user@example.com",
    "avatar": "https://api.dicebear.com/7.x/identicon/svg?seed=John"
  }
  ```
* **是否需要登录**: 是

### 1.5 修改个人资料
* **请求方法**: `PUT`
* **请求路径**: `/api/auth/profile`
* **Headers**: `Authorization: Bearer <token>`
* **请求参数 (JSON)**:
  ```json
  {
    "username": "John New",
    "email": "john_new@example.com",
    "avatar": "https://api.dicebear.com/7.x/identicon/svg?seed=JohnNew",
    "gender": "male",
    "birthday": "1998-10-12",
    "bio": "自古英雄多寂寞，唯有饮者留其名。"
  }
  ```
* **响应数据型 (`data`)**: 更新成功后的新用户信息
  ```json
  {
    "id": "u-12345",
    "username": "John New",
    "email": "john_new@example.com",
    "avatar": "https://api.dicebear.com/7.x/identicon/svg?seed=JohnNew",
    "gender": "male",
    "birthday": "1998-10-12",
    "bio": "自古英雄多寂寞，唯有饮者留其名。",
    "createdAt": "2026-01-15 14:32:01",
    "lastLoginAt": "2026-06-02 10:59:00"
  }
  ```
* **是否需要登录**: 是

### 1.6 发送邮箱验证码
* **请求方法**: `POST`
* **请求路径**: `/api/auth/email/send-code`
* **Headers**: `Authorization: Bearer <token>`
* **请求参数 (JSON)**:
  ```json
  {
    "email": "new_email@example.com"
  }
  ```
* **响应数据型 (`data`)**: 返回新发送的 `6` 位数字验证码（演示用途）
  ```json
  "582910"
  ```
* **是否需要登录**: 是

### 1.7 使用验证码修改邮箱地址
* **请求方法**: `PUT`
* **请求路径**: `/api/auth/email/update`
* **Headers**: `Authorization: Bearer <token>`
* **请求参数 (JSON)**:
  ```json
  {
    "email": "new_email@example.com",
    "code": "582910"
  }
  ```
* **响应数据型 (`data`)**: 修改成功后的最新用户信息
  ```json
  {
    "id": "u-12345",
    "username": "John Doe",
    "email": "new_email@example.com",
    "avatar": "https://api.dicebear.com/7.x/identicon/svg?seed=John",
    "gender": "keep_secret",
    "birthday": "1998-10-12",
    "bio": "这是一名神秘的网盘尊贵用户。",
    "createdAt": "2026-01-15 14:32:01",
    "lastLoginAt": "2026-06-02 10:59:00"
  }
  ```
* **是否需要登录**: 是

---

## 2. 文件接口 (File Explorer API)

### 2.1 获取文件列表 (支持层级、过滤和排序)
* **请求方法**: `GET`
* **请求路径**: `/api/files`
* **Headers**: `Authorization: Bearer <token>`
* **查询参数**:
  * `folderId`: 文件夹 ID（可选，若不传或传空，代表请求根目录 `/`）
  * `keyword`: 搜索关键字（可选，支持全局或当前目录模糊搜索）
  * `sortBy`: 排序字段 (`name` | `size` | `createdAt` | `updatedAt`)，默认为 `name`
  * `sortOrder`: 升降序 (`asc` | `desc`)，默认为 `asc`
  * `type`: 类别过滤 (`folder` | `image` | `pdf` | `text` | `video` | `audio` | `all` 等)，默认为 `all`
* **响应数据型 (`data` -> `FileListResult`)**:
  ```json
  {
    "list": [
      {
        "id": "f-1",
        "name": "Assets Library",
        "type": "folder",
        "size": 2576980377,
        "parentId": null,
        "createdAt": "2026-05-20T08:00:00Z",
        "updatedAt": "2026-05-25T12:30:00Z"
      },
      {
        "id": "f-2",
        "name": "Brand_Identity.png",
        "type": "image",
        "size": 12582912,
        "parentId": null,
        "url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
        "previewUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
        "downloadUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop",
        "createdAt": "2026-05-31T20:12:00Z",
        "updatedAt": "2026-06-01T02:15:00Z",
        "isStarred": true
      }
    ],
    "total": 2,
    "currentFolderId": null,
    "breadcrumbs": [
      { "id": null, "name": "My Files" }
    ]
  }
  ```
* **是否需要登录**: 是

### 2.2 创建新建文件夹
* **请求方法**: `POST`
* **请求路径**: `/api/files/folder`
* **Headers**: `Authorization: Bearer <token>`
* **请求参数 (JSON)**:
  ```json
  {
    "name": "New Folder Name",
    "parentId": "f-1" // 为空或 null 表示在根目录下
  }
  ```
* **响应数据型 (`data` -> `FileItem`)**: 新建成功的文件夹信息
* **异常原因**: 同级文件夹名重复、名称含有非法字符。
* **是否需要登录**: 是

### 2.3 重命名文件/文件夹
* **请求方法**: `PATCH`
* **请求路径**: `/api/files/:fileId/rename`
* **Headers**: `Authorization: Bearer <token>`
* **请求参数 (JSON)**:
  ```json
  {
    "name": "New Awesome Name.png"
  }
  ```
* **响应数据型 (`data` -> `FileItem`)**: 更新后完整的文件信息
* **异常返回**: 404 (文件找不到)，400 (命名重复/空值等)
* **是否需要登录**: 是

### 2.4 删除文件/文件夹
* **请求方法**: `DELETE`
* **请求路径**: `/api/files/:fileId`
* **Headers**: `Authorization: Bearer <token>`
* **查询参数**:
  * `permanent`: `true` | `false`。如果是 `false`（默认），则放入回收站（设置 `isDeleted: true`）；如果是 `true`，则彻底删除。
* **响应数据型 (`data`)**: `null` (或 `"deleted"`)
* **是否需要登录**: 是

### 2.5 切换/修改文件的收藏状态 (Star)
* **请求方法**: `PATCH`
* **请求路径**: `/api/files/:fileId/star`
* **Headers**: `Authorization: Bearer <token>`
* **请求参数**: 无
* **响应数据型 (`data` -> `FileItem`)**: 变更后的文件数据 (如 `isStarred: true/false`)
* **是否需要登录**: 是

### 2.6 文件假上传 (前端模拟层保留 API)
* **请求方法**: `POST`
* **请求路径**: `/api/files/upload`
* **Headers**: `Authorization: Bearer <token>`
* **请求参数**: `multipart/form-data`
  * `file`: 二进制文件数据
  * `parentId`: 目标文件夹 ID (可选)
* **响应数据型 (`data` -> `FileItem`)**: 成功上传并落库的文件信息体
* **是否需要登录**: 是

### 2.7 获取文件预览信息
* **请求方法**: `GET`
* **请求路径**: `/api/files/:fileId/preview`
* **Headers**: `Authorization: Bearer <token>`
* **响应数据型 (`data`)**:
  ```json
  {
    "fileId": "f-3",
    "name": "Design_Manual.pdf",
    "type": "pdf",
    "size": 4718592,
    "previewUrl": "/mock-assets/design_manual.pdf",
    "content": "This is text preview content in case of simple text format..."
  }
  ```
* **是否需要登录**: 是

### 2.8 移动文件/文件夹
* **请求方法**: `POST`
* **请求路径**: `/api/files/:fileId/move`
* **Headers**: `Authorization: Bearer <token>`
* **请求参数 (JSON)**:
  ```json
  {
    "targetParentId": "f-folder-123" // 目标文件夹 ID，若移动到根目录则传 null
  }
  ```
* **响应数据型 (`data` -> `FileItem`)**: 移动成功后被更新的文件信息
* **是否需要登录**: 是

### 2.9 复制文件/文件夹
* **请求方法**: `POST`
* **请求路径**: `/api/files/:fileId/copy`
* **Headers**: `Authorization: Bearer <token>`
* **请求参数 (JSON)**:
  ```json
  {
    "targetParentId": "f-folder-123" // 目标文件夹 ID，若复制到根目录则传 null
  }
  ```
* **响应数据型 (`data` -> `FileItem`)**: 复制成功后所产生的新文件信息 (如果同名会自动添加 `_副本`、`_副本1` 这种后缀)
* **是否需要登录**: 是

---

## 3. 分享管理接口 (Share Board API)

### 3.1 创建共享资源链接
* **请求方法**: `POST`
* **请求路径**: `/api/shares`
* **Headers**: `Authorization: Bearer <token>`
* **请求参数 (JSON)**:
  ```json
  {
    "fileId": "f-2",
    "expireType": "7d" // "forever" | "7d" | "30d"
  }
  ```
* **响应数据型 (`data` -> `ShareInfo`)**:
  ```json
  {
    "id": "s-999",
    "fileId": "f-2",
    "fileName": "Brand_Identity.png",
    "fileType": "image",
    "fileSize": 12582912,
    "shareToken": "st-rand123",
    "shareUrl": "https://ais-dev-h364yducpmcpymm7ucmevw-68533051448.us-west2.run.app/share/st-rand123",
    "permission": "download",
    "expireType": "7d",
    "expiredAt": "2026-06-08T09:47:43Z",
    "createdAt": "2026-06-01T09:47:43Z"
  }
  ```
* **是否需要登录**: 是

### 3.2 获取当前用户生成的全部分享
* **请求方法**: `GET`
* **请求路径**: `/api/shares`
* **Headers**: `Authorization: Bearer <token>`
* **响应数据型 (`data`)**: `ShareInfo[]`
* **是否需要登录**: 是

### 3.3 取消/删除某项分享
* **请求方法**: `DELETE`
* **请求路径**: `/api/shares/:shareId`
* **Headers**: `Authorization: Bearer <token>`
* **响应数据型 (`data`)**: `null` (或 `"canceled"`)
* **是否需要登录**: 是

---

## 4. 公开分享页端点 (Public Access API - 不需要登录)

### 4.1 获取公开分享链接对应的信息
* **请求方法**: `GET`
* **请求路径**: `/api/public/shares/:shareToken`
* **请求参数**: 无
* **响应数据型 (`data` -> `ShareInfo`)**: 返回公共文件名称、大小、分享者、过期状态等。不带私人敏感路径数据。
* **异常返回 (如过期或失效)**:
  ```json
  {
    "code": 40410,
    "msg": "该分享链接不存在或已过期",
    "data": null,
    "success": false,
    "errorMsg": "Share token expired or not found in mock store"
  }
  ```
* **是否需要登录**: 否

### 4.2 免密公开分享下载操作
* **请求方法**: `GET`
* **请求路径**: `/api/public/shares/:shareToken/download`
* **响应数据型**: 重定向到实际存储文件地址（或 Mock 下载数据）
* **是否需要登录**: 否
