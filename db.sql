-- =============================================================================
-- 演示仿真云网盘系统 (NetDisk) 物理数据库表结构设计 (MySQL 8.x)
-- 创建时间: 2026-06-02
-- 包含：用户账户表、文件目录表、外链分享表、邮箱验证流水表
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `netdisk_db` 
    DEFAULT CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE `netdisk_db`;

-- -----------------------------------------------------------------------------
-- 1. 用户表 (users)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` VARCHAR(64) NOT NULL COMMENT '用户唯一标识 (UUID/自定义随机字符串)',
    `username` VARCHAR(50) NOT NULL COMMENT '登录账户用户名',
    `email` VARCHAR(100) NOT NULL COMMENT '电子账户邮箱 (唯一登录凭证)',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '加盐哈希后的安全加密密码',
    `avatar` MEDIUMTEXT DEFAULT NULL COMMENT '用户头像地址 (支持万能 HTTPS 外链或 Base64 大文本)',
    `gender` ENUM('male', 'female', 'other', 'keep_secret') DEFAULT 'keep_secret' COMMENT '性别 (male:男, female:女, other:其它, keep_secret:保密)',
    `birthday` DATE DEFAULT NULL COMMENT '生日出生日期 (YYYY-MM-DD)',
    `bio` VARCHAR(255) DEFAULT NULL COMMENT '用户个性的个人简介描述',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '用户注册开通时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '用户个人信息最后一次修改时间',
    `last_login_at` DATETIME DEFAULT NULL COMMENT '用户最后一次成功登录的审计记录时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_email` (`email`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户基础账户及专属基本资料信息表';

-- -----------------------------------------------------------------------------
-- 2. 文件及目录层级树状表 (files)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `files`;
CREATE TABLE `files` (
    `id` VARCHAR(64) NOT NULL COMMENT '文件或文件夹唯一标识 (UUID)',
    `name` VARCHAR(255) NOT NULL COMMENT '文件或文件夹展示名称',
    `type` ENUM('file', 'folder') NOT NULL COMMENT '节点类型 (file:文件, folder:文件夹)',
    `parent_id` VARCHAR(64) DEFAULT NULL COMMENT '父级文件夹节点 ID (自关联外键，根目录默认值为 NULL)',
    `size` BIGINT DEFAULT 0 COMMENT '文件物理占用磁盘大小 (单位: 字节, 文件夹属性项默认记录 0)',
    `extension` VARCHAR(50) DEFAULT NULL COMMENT '文件扩展名后缀 (例如: pdf, zip, png, mp4; 文件夹固定为 NULL)',
    `mime_type` VARCHAR(127) DEFAULT NULL COMMENT '媒体内容网络标准分类 MIME 类型 (例如: image/png, application/zip)',
    `file_path` TEXT DEFAULT NULL COMMENT '文件在持久化存储层 (如 OSS / 物理服务器磁盘) 上的虚拟寻址绝对物理路径',
    `checksum` VARCHAR(64) DEFAULT NULL COMMENT '整个物理文件的 MD5 哈希数字指纹 (用于服务器端瞬时秒传、文件内容高效去重判别)',
    `owner_id` VARCHAR(64) NOT NULL COMMENT '拥有该节点资源的归属用户账户 ID',
    `is_starred` TINYINT(1) DEFAULT 0 COMMENT '是否将该项加入快捷“星标收藏” (0: 否, 1: 是)',
    `is_trashed` TINYINT(1) DEFAULT 0 COMMENT '是否已被移入回收站待清理 (0: 正常使用, 1: 回收站状态)',
    `trashed_at` DATETIME DEFAULT NULL COMMENT '移入网盘物理回收站的具体时刻 (用于定期轮巡物理自动降解清理)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '文件树节点实例化创建时间 (上传/新建文件夹)',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后一次内容修改、移动或改名的维护时间',
    PRIMARY KEY (`id`),
    KEY `idx_owner_parent` (`owner_id`, `parent_id`) COMMENT '用于支持高并发请求下定位特定目录下属于该用户的全部文件',
    KEY `idx_checksum` (`checksum`) COMMENT '秒传及高吞吐哈希极速去重查询辅助索引',
    CONSTRAINT `fk_files_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网络云盘目录组织及文件节点物理元数据描述主表';

-- -----------------------------------------------------------------------------
-- 3. 外链公共分享资源表 (shares)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `shares`;
CREATE TABLE `shares` (
    `id` VARCHAR(64) NOT NULL COMMENT '分享链接公共访问 UUID (拼接在前端共享路径路由中)',
    `file_id` VARCHAR(64) NOT NULL COMMENT '被发起对外公开分享的文件或文件夹原始节点 ID',
    `creator_id` VARCHAR(64) NOT NULL COMMENT '执行本次公共导出分享的操作用户账户 ID',
    `share_code` VARCHAR(20) DEFAULT NULL COMMENT '访问网盘公共分享时所需的四位数字或字母星号保护密码 (NULL 为免密公开)',
    `expire_type` ENUM('never', '1day', '7day', '30day') DEFAULT 'never' COMMENT '用户期望设定的有效期限档位 (never:永久, 1day:1天, 7day:7天, 30day:30天)',
    `expires_at` DATETIME DEFAULT NULL COMMENT '到期自动取消公共分享的具体截至物理时刻时间 (为 NULL 时永久不失效)',
    `view_count` INT UNSIGNED DEFAULT 0 COMMENT '外链发布后被所有互联网公共访客浏览/打开展示的累计页面 PV 计数',
    `download_count` INT UNSIGNED DEFAULT 0 COMMENT '外链发布后由来宾访问者调起后端总共下载成功的次数',
    `status` TINYINT DEFAULT 1 COMMENT '分享活动生命周期状态指针 (1: 生效活跃, 0: 管理员或上传者手动撤回封锁, 2: 期满自行休眠)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '公共外链生成并对外开放的时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '外链属性(如加密密码或到期时间)变动时的同步瞬时时间',
    PRIMARY KEY (`id`),
    KEY `idx_creator` (`creator_id`) COMMENT '快速检索某个特定用户对外部网盘公开过的所有分享列表',
    KEY `idx_file` (`file_id`) COMMENT '查询对应原始云盘资源上是否已被绑定的活跃分享句柄',
    CONSTRAINT `fk_shares_file` FOREIGN KEY (`file_id`) REFERENCES `files` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_shares_creator` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网盘文件资源对外一键公共广播与临时分享业务总链表';

-- -----------------------------------------------------------------------------
-- 4. 邮箱核验安全密匙流水表 (email_verifications)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `email_verifications`;
CREATE TABLE `email_verifications` (
    `id` BIGINT AUTO_INCREMENT NOT NULL COMMENT '主键自增 ID',
    `email` VARCHAR(100) NOT NULL COMMENT '本次进行信息校验、收发通知的目标新/旧电子邮箱凭证号',
    `code` VARCHAR(10) NOT NULL COMMENT '下发至用户邮箱的一周内唯一六位数字验证密匙',
    `type` VARCHAR(30) NOT NULL COMMENT '核心安全业务动作标签 (update_email:更换绑定邮箱, register:注册账户, reset_password:重置账户密码)',
    `is_used` TINYINT(1) DEFAULT 0 COMMENT '此发出的验证码是否已被最终输入且兑现使用 (0: 鲜活、1: 已被确认消耗)',
    `expires_at` DATETIME NOT NULL COMMENT '本 6 位临时验证码的时效物理过期截止时刻',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '向用户的邮件通道发起一次性下发动作的注册记录时间',
    PRIMARY KEY (`id`),
    KEY `idx_email_code_type` (`email`, `code`, `type`) COMMENT '高维优化核验拦截和安全验证时的三合一全匹配联合查找索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网盘账户敏感信息验证码下发频率监控与安全凭证检验中心对照表';
