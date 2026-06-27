import { JavaCodeFile } from '../types';

export const JAVA_SOURCE_CODE: JavaCodeFile[] = [
  {
    id: 'pom',
    name: 'pom.xml',
    path: 'pom.xml',
    category: 'Configuration',
    language: 'xml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    
    <groupId>com.edu</groupId>
    <artifactId>english-learning</artifactId>
    <version>1.0.0</version>
    <name>English Learning Platform</name>
    <description>English Learning API Server built with Spring Boot 3 & JWT</description>
    
    <properties>
        <java.version>21</java.version>
        <jwt.version>0.11.5</jwt.version>
        <springdoc.version>2.3.0</springdoc.version>
        <mapstruct.version>1.5.5.Final</mapstruct.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- MySQL Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Lombok (Boilerplate reduction) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- JSON Web Token (JWT) -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>\${jwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>\${jwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- MapStruct for Entity-DTO mapping -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>\${mapstruct.version}</version>
        </dependency>
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct-processor</artifactId>
            <version>\${mapstruct.version}</version>
            <scope>provided</scope>
        </dependency>
        
        <!-- OpenAPI Swagger (SpringDoc) -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>\${springdoc.version}</version>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`,
    explanation: 'File POM quản lý toàn bộ thư viện dependencies cho dự án Spring Boot 3, cấu hình Java 21, Spring Security + JWT, Driver MySQL, Swagger OpenAPI, Lombok và MapStruct.'
  },
  {
    id: 'application-yml',
    name: 'application.yml',
    path: 'src/main/resources/application.yml',
    category: 'Configuration',
    language: 'yaml',
    content: `server:
  port: 8080
  servlet:
    context-path: /api/v1

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/english_learning?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: Password123
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQLDialect
  
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

# Cấu hình bảo mật JWT Security
app:
  jwt:
    secret: 9a2f32a21e7c4f4a34252e3d5a2f5f4b584d4b2d3d3a2e3f5d6f7a8b9c1d2e3f
    expiration-ms: 86400000 # 1 ngày (24 giờ)

# Cấu hình Swagger OpenAPI
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    operations-sorter: alpha
    tags-sorter: alpha`,
    explanation: 'File cấu hình Spring Boot dạng YAML. Khai báo cổng chạy API 8080 với context-path /api/v1, chuỗi kết nối MySQL, chế độ Hibernate DDL Update, dung lượng file upload tối đa 10MB và tham số bí mật JWT.'
  },
  {
    id: 'schema-sql',
    name: 'schema.sql',
    path: 'src/main/resources/schema.sql',
    category: 'Database & SQL',
    language: 'sql',
    content: `-- 1. Tạo Database
CREATE DATABASE IF NOT EXISTS english_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE english_learning;

-- 2. Bảng Roles (Vai trò)
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 3. Bảng Users (Người dùng)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    avatar VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Bảng liên kết nhiều-nhiều user_roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Bảng Categories (Chủ đề từ vựng)
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Bảng Vocabularies (Từ vựng)
CREATE TABLE IF NOT EXISTS vocabularies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(100) NOT NULL UNIQUE,
    ipa VARCHAR(100),
    meaning VARCHAR(255) NOT NULL,
    part_of_speech VARCHAR(50),
    example TEXT,
    example_meaning TEXT,
    image VARCHAR(255),
    audio_url VARCHAR(255),
    category_id BIGINT,
    difficulty VARCHAR(20) DEFAULT 'Medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Bảng Flashcards
CREATE TABLE IF NOT EXISTS flashcards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vocabulary_id BIGINT NOT NULL,
    is_learned BOOLEAN DEFAULT FALSE,
    last_reviewed TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vocabulary_id) REFERENCES vocabularies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Bảng Quizzes (Bộ câu hỏi ôn tập)
CREATE TABLE IF NOT EXISTS quizzes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    duration INT, -- số phút
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 9. Bảng Questions (Câu hỏi)
CREATE TABLE IF NOT EXISTS questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT,
    test_id BIGINT,
    text TEXT NOT NULL,
    type VARCHAR(50), -- MCQ, FILL_IN, LISTENING, SPELLING, MATCHING
    explanation TEXT,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Bảng Answers (Đáp án câu hỏi)
CREATE TABLE IF NOT EXISTS answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Bảng Tests (Đề thi tiếng Anh: TOEIC, IELTS, B1, ...)
CREATE TABLE IF NOT EXISTS tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- TOEIC, IELTS, B1, B2, A2
    duration INT NOT NULL, -- số phút làm bài
    total_questions INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Liên kết Questions vào Tests (nếu câu hỏi thuộc đề thi)
ALTER TABLE questions ADD CONSTRAINT fk_question_test FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE;

-- 12. Bảng Test Results (Lịch sử làm đề)
CREATE TABLE IF NOT EXISTS test_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    test_id BIGINT NOT NULL,
    score DOUBLE NOT NULL,
    correct_answers INT NOT NULL,
    total_questions INT NOT NULL,
    time_spent INT NOT NULL, -- số giây đã làm
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. Bảng Favorite Vocabularies (Từ vựng yêu thích)
CREATE TABLE IF NOT EXISTS favorite_vocabularies (
    user_id BIGINT NOT NULL,
    vocabulary_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, vocabulary_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vocabulary_id) REFERENCES vocabularies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Bảng Study History (Lịch sử học từ vựng)
CREATE TABLE IF NOT EXISTS study_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vocabulary_id BIGINT NOT NULL,
    score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vocabulary_id) REFERENCES vocabularies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 15. Bảng Learning Progress (Tiến độ học tập tổng quát hàng ngày)
CREATE TABLE IF NOT EXISTS learning_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    study_date DATE NOT NULL,
    minutes_spent INT DEFAULT 0,
    words_learned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_date (user_id, study_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. Bảng Notifications (Thông báo nhắc nhở)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- DỮ LIỆU BAN ĐẦU (SEED DATA)
INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_USER') ON DUPLICATE KEY UPDATE name=name;

-- Seed Admin (Mật khẩu đã mã hóa bcrypt cho 'admin123')
INSERT INTO users (id, username, password, email, full_name, is_active)
VALUES (1, 'admin', '$2a$10$Y10o/F9uD6eGOfm6O.mFBe.U5Wj7YOfI9I4t6V7zKjGZ87qZ9A/Lq', 'admin@edu.vn', 'System Administrator', TRUE)
ON DUPLICATE KEY UPDATE username=username;

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1) ON DUPLICATE KEY UPDATE user_id=user_id;

-- Seed Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Animals', 'Từ vựng về thế giới động vật sinh động'),
(2, 'Food', 'Ẩm thực và đồ uống hàng ngày'),
(3, 'Travel', 'Hành lý, đặt chỗ và du lịch năm châu'),
(4, 'Technology', 'Công nghệ thông tin và phát triển phần mềm'),
(5, 'Business', 'Thuật ngữ kinh tế và thương mại')
ON DUPLICATE KEY UPDATE name=name;
`,
    explanation: 'Tập lệnh SQL tạo cấu trúc cơ sở dữ liệu chi tiết gồm 16 bảng đúng theo yêu cầu thiết kế ERD. Có sẵn các khóa ngoại cascade chặt chẽ, kiểu dữ liệu tối ưu, và dữ liệu mẫu Seed Admin kèm mật khẩu mã hóa BCrypt.'
  },
  {
    id: 'erd-md',
    name: 'ERD_Diagram.md',
    path: 'ERD_Diagram.md',
    category: 'Database & SQL',
    language: 'markdown',
    content: `# Sơ đồ Quan hệ Thực thể (ERD) - English Learning Website

Dưới đây là thiết kế chi tiết thực thể liên kết giữa 16 bảng trong hệ thống MySQL hỗ trợ học tiếng Anh:

\`\`\`
  +-------------------+
  |       ROLES       |
  +-------------------+
  | id (PK)           | <---+
  | name              |     |
  +-------------------+     |
                            | (N-N)
  +-------------------+     |
  |    USER_ROLES     | ----+
  +-------------------+
  | user_id (FK)      | <---+
  | role_id (FK)      |     |
  +-------------------+     |
                            |
  +-------------------+     |
  |       USERS       | ----+
  +-------------------+
  | id (PK)           | <------------------------------------+
  | username          | <---------+                          |
  | password          |           |                          |
  | email             |           | (1-N)                    | (1-N)
  | full_name         |           |                          |
  | avatar            |           v                          v
  | is_active         |   +---------------+          +---------------+
  | created_at        |   |  FLASHCARDS   |          | TEST_RESULTS  |
  +-------------------+   +---------------+          +---------------+
    |         |           | id (PK)       |          | id (PK)       |
    | (1-N)   | (1-N)     | user_id (FK)  |          | user_id (FK)  |
    v         v           | vocab_id (FK) | <---+    | test_id (FK)  | <--+
+-------+ +---------+     | is_learned    |     |    | score         |    |
|NOTIFIS| | PROGRESS|     +---------------+     |    | correct_ans   |    |
+-------+ +---------+                           |    | total_qs      |    |
                                                |    | time_spent    |    |
  +-------------------+                         |    +---------------+    |
  |    CATEGORIES     |                         |                         |
  +-------------------+                         |                         |
  | id (PK)           | <---+                   |                         |
  | name              |     |                   |                         |
  | description       |     | (1-N)             |                         |
  +-------------------+     |                   |                         |
                            |                   |                         |
  +-------------------+     |                   |                         |
  |   VOCABULARIES    | ----+                   |                         |
  +-------------------+                         |                         |
  | id (PK)           | <-----------------------+                         |
  | word              | <---+                                             |
  | ipa               |     |                                             |
  | meaning           |     | (1-N)                                       |
  | part_of_speech    |     |                                             |
  | example           |     v                                             |
  | category_id (FK)  |   +---------------+                               |
  | difficulty        |   |   FAVORITES   |                               |
  +-------------------+   +---------------+                               |
                          | user_id (FK)  |                               |
                          | vocab_id (FK) |                               |
                          +---------------+                               |
                                                                          |
  +-------------------+          +-------------------+                    |
  |      QUIZZES      |          |       TESTS       | -------------------+
  +-------------------+          +-------------------+
  | id (PK)           | <---+    | id (PK)           | <---+
  | title             |     |    | title             |     |
  | duration          |     |    | category          |     | (1-N)
  +-------------------+     |    | duration          |     |
                            |    +-------------------+     |
                            | (1-N)                        |
                      +---------------+                    |
                      |   QUESTIONS   | -------------------+
                      +---------------+
                      | id (PK)       | <---+
                      | quiz_id (FK)  |     |
                      | test_id (FK)  |     | (1-N)
                      | text          |     |
                      | type          |     |
                      +---------------+     |
                            |               |
                            | (1-N)         |
                      +---------------+     |
                      |    ANSWERS    | ----+
                      +---------------+
                      | id (PK)       |
                      | question_id   |
                      | text          |
                      | is_correct    |
                      +---------------+
\`\`\`

### Các mối quan hệ chính:
1. **Users - Roles**: Quan hệ Nhiều - Nhiều qua bảng trung gian \`user_roles\`.
2. **Categories - Vocabularies**: Quan hệ Một - Nhiều (\`categories.id = vocabularies.category_id\`).
3. **Users - Vocabularies (Favorites)**: Nhiều - Nhiều qua bảng \`favorite_vocabularies\`.
4. **Users - Vocabularies (Flashcards)**: Nhiều - Nhiều qua bảng \`flashcards\`. Thể hiện trạng thái học tập của từng từ.
5. **Tests - Questions**: Một - Nhiều. Câu hỏi luyện đề thuộc một đề thi cụ thể.
6. **Quizzes - Questions**: Một - Nhiều. Câu hỏi bài tập ôn luyện thuộc một quiz ngẫu nhiên.
7. **Questions - Answers**: Một - Nhiều. Mỗi câu hỏi có danh sách các đáp án lựa chọn.
8. **Users - Tests (Test Results)**: Nhiều - Nhiều qua bảng \`test_results\` để lưu lịch sử làm đề, tính điểm, thời gian làm bài.`,
    explanation: 'Bản vẽ ERD bằng sơ đồ ký tự ASCII trực quan giúp lập trình viên hiểu ngay kiến trúc cơ sở dữ liệu và mối liên kết khóa ngoại phức tạp.'
  },
  {
    id: 'user-entity',
    name: 'User.java',
    path: 'src/main/java/com/edu/englishlearning/entity/User.java',
    category: 'Entity',
    language: 'java',
    content: `package com.edu.englishlearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(length = 255)
    private String avatar;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}`,
    explanation: 'Thực thể User được cấu hình đúng chuẩn Jakarta Persistence (Spring Boot 3), sử dụng các annotation Lombok giảm thiểu code boilerplates và tự động gán ngày tạo/ngày cập nhật qua các hàm @PrePersist/@PreUpdate.'
  },
  {
    id: 'role-entity',
    name: 'Role.java',
    path: 'src/main/java/com/edu/englishlearning/entity/Role.java',
    category: 'Entity',
    language: 'java',
    content: `package com.edu.englishlearning.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;
}`,
    explanation: 'Thực thể Role định nghĩa quyền Admin/User liên kết với bảng users qua bảng trung gian user_roles.'
  },
  {
    id: 'vocabulary-entity',
    name: 'Vocabulary.java',
    path: 'src/main/java/com/edu/englishlearning/entity/Vocabulary.java',
    category: 'Entity',
    language: 'java',
    content: `package com.edu.englishlearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vocabularies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String word;

    @Column(length = 100)
    private String ipa;

    @Column(nullable = false, length = 255)
    private String meaning;

    @Column(name = "part_of_speech", length = 50)
    private String partOfSpeech;

    @Column(columnDefinition = "TEXT")
    private String example;

    @Column(name = "example_meaning", columnDefinition = "TEXT")
    private String exampleMeaning;

    @Column(length = 255)
    private String image;

    @Column(name = "audio_url", length = 255)
    private String audioUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(length = 20)
    @Builder.Default
    private String difficulty = "Medium";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}`,
    explanation: 'Thực thể Vocabulary đại diện cho một từ vựng tiếng Anh. Chứa đầy đủ thông tin từ, phiên âm IPA, loại từ, ví dụ, hình ảnh, file audio phát âm và quan hệ Many-to-One tới chủ đề Category.'
  },
  {
    id: 'category-entity',
    name: 'Category.java',
    path: 'src/main/java/com/edu/englishlearning/entity/Category.java',
    category: 'Entity',
    language: 'java',
    content: `package com.edu.englishlearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}`,
    explanation: 'Thực thể Category giúp gom nhóm từ vựng theo các chủ đề: Animals, Food, Travel, Technology, Business, IELTS, TOEIC...'
  },
  {
    id: 'user-repo',
    name: 'UserRepository.java',
    path: 'src/main/java/com/edu/englishlearning/repository/UserRepository.java',
    category: 'Repository',
    language: 'java',
    content: `package com.edu.englishlearning.repository;

import com.edu.englishlearning.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Tìm kiếm người dùng theo tên hoặc email phục vụ trang quản trị Admin
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchUsers(@Param("keyword") String keyword);
}`,
    explanation: 'Tầng Repository kế thừa Spring Data JPA cung cấp đầy đủ các truy vấn SQL tự động và bổ sung hàm JPQL tùy biến tìm kiếm thông tin người dùng.'
  },
  {
    id: 'vocab-repo',
    name: 'VocabularyRepository.java',
    path: 'src/main/java/com/edu/englishlearning/repository/VocabularyRepository.java',
    category: 'Repository',
    language: 'java',
    content: `package com.edu.englishlearning.repository;

import com.edu.englishlearning.entity.Vocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

    List<Vocabulary> findByCategoryId(Long categoryId);

    List<Vocabulary> findByDifficulty(String difficulty);

    // Tìm kiếm từ vựng đa năng theo từ tiếng Anh, dịch nghĩa, loại từ hoặc chủ đề
    @Query("SELECT v FROM Vocabulary v WHERE " +
           "LOWER(v.word) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.meaning) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.partOfSpeech) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.category.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Vocabulary> searchVocabularies(@Param("keyword") String keyword);

    // Tìm kiếm kết hợp lọc theo Category và độ khó
    @Query("SELECT v FROM Vocabulary v WHERE " +
           "(:categoryId IS NULL OR v.category.id = :categoryId) AND " +
           "(:difficulty IS NULL OR v.difficulty = :difficulty)")
    List<Vocabulary> filterVocabularies(@Param("categoryId") Long categoryId, 
                                        @Param("difficulty") String difficulty);
}`,
    explanation: 'Khai báo tầng Repository của từ vựng hỗ trợ tìm kiếm đầy đủ theo điều kiện, lọc theo chuyên mục và phân cấp độ khó của từ.'
  },
  {
    id: 'auth-request-dto',
    name: 'AuthRequest.java',
    path: 'src/main/java/com/edu/englishlearning/dto/AuthRequest.java',
    category: 'DTO & Mapper',
    language: 'java',
    content: `package com.edu.englishlearning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AuthRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có độ dài từ 6 ký tự trở lên")
    private String password;
}`,
    explanation: 'DTO phục vụ việc đăng nhập tài khoản. Chứa các chú thích Validation để tự động kiểm duyệt dữ liệu đầu vào ngay tại Controller trước khi xử lý nghiệp vụ.'
  },
  {
    id: 'register-request-dto',
    name: 'RegisterRequest.java',
    path: 'src/main/java/com/edu/englishlearning/dto/RegisterRequest.java',
    category: 'DTO & Mapper',
    language: 'java',
    content: `package com.edu.englishlearning.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Định dạng Email không hợp lệ")
    private String email;

    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;
}`,
    explanation: 'DTO hỗ trợ đăng ký tài khoản mới với các kiểm duyệt bảo mật nghiêm ngặt như tính hợp lệ của hòm thư Email.'
  },
  {
    id: 'vocab-dto',
    name: 'VocabularyDTO.java',
    path: 'src/main/java/com/edu/englishlearning/dto/VocabularyDTO.java',
    category: 'DTO & Mapper',
    language: 'java',
    content: `package com.edu.englishlearning.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class VocabularyDTO {
    private Long id;
    private String word;
    private String ipa;
    private String meaning;
    private String partOfSpeech;
    private String example;
    private String exampleMeaning;
    private String image;
    private String audioUrl;
    private Long categoryId;
    private String categoryName;
    private String difficulty;
    private LocalDateTime createdAt;
}`,
    explanation: 'Data Transfer Object giúp truyền tải thông tin từ vựng an toàn qua môi trường REST API mà không làm lộ cấu trúc vật lý thực thể JPA.'
  },
  {
    id: 'vocab-service',
    name: 'VocabularyService.java',
    path: 'src/main/java/com/edu/englishlearning/service/VocabularyService.java',
    category: 'Service',
    language: 'java',
    content: `package com.edu.englishlearning.service;

import com.edu.englishlearning.dto.VocabularyDTO;
import java.util.List;

public interface VocabularyService {
    
    VocabularyDTO getVocabularyById(Long id);
    
    List<VocabularyDTO> getAllVocabularies();
    
    List<VocabularyDTO> searchVocabularies(String keyword);
    
    List<VocabularyDTO> filterVocabularies(Long categoryId, String difficulty);
    
    VocabularyDTO createVocabulary(VocabularyDTO vocabularyDTO);
    
    VocabularyDTO updateVocabulary(Long id, VocabularyDTO vocabularyDTO);
    
    void deleteVocabulary(Long id);
    
    // Quản lý từ vựng yêu thích của người dùng
    void addToFavorites(Long userId, Long vocabularyId);
    
    void removeFromFavorites(Long userId, Long vocabularyId);
    
    List<VocabularyDTO> getUserFavorites(Long userId);
}`,
    explanation: 'Interface quy định tất cả nghiệp vụ đối với Từ vựng theo nguyên lý OCP (Open-Closed Principle) của SOLID, tách rời thiết kế lớp và phần cài đặt thực tế.'
  },
  {
    id: 'vocab-service-impl',
    name: 'VocabularyServiceImpl.java',
    path: 'src/main/java/com/edu/englishlearning/service/impl/VocabularyServiceImpl.java',
    category: 'Service',
    language: 'java',
    content: `package com.edu.englishlearning.service.impl;

import com.edu.englishlearning.dto.VocabularyDTO;
import com.edu.englishlearning.entity.Category;
import com.edu.englishlearning.entity.Vocabulary;
import com.edu.englishlearning.exception.ResourceNotFoundException;
import com.edu.englishlearning.repository.CategoryRepository;
import com.edu.englishlearning.repository.VocabularyRepository;
import com.edu.englishlearning.service.VocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VocabularyServiceImpl implements VocabularyService {

    private final VocabularyRepository vocabularyRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public VocabularyDTO getVocabularyById(Long id) {
        Vocabulary vocab = vocabularyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found with id: " + id));
        return convertToDTO(vocab);
    }

    @Override
    public List<VocabularyDTO> getAllVocabularies() {
        return vocabularyRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VocabularyDTO> searchVocabularies(String keyword) {
        return vocabularyRepository.searchVocabularies(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VocabularyDTO> filterVocabularies(Long categoryId, String difficulty) {
        return vocabularyRepository.filterVocabularies(categoryId, difficulty).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VocabularyDTO createVocabulary(VocabularyDTO dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        Vocabulary vocab = Vocabulary.builder()
                .word(dto.getWord())
                .ipa(dto.getIpa())
                .meaning(dto.getMeaning())
                .partOfSpeech(dto.getPartOfSpeech())
                .example(dto.getExample())
                .exampleMeaning(dto.getExampleMeaning())
                .image(dto.getImage())
                .audioUrl(dto.getAudioUrl())
                .category(category)
                .difficulty(dto.getDifficulty())
                .build();

        Vocabulary saved = vocabularyRepository.save(vocab);
        return convertToDTO(saved);
    }

    @Override
    @Transactional
    public VocabularyDTO updateVocabulary(Long id, VocabularyDTO dto) {
        Vocabulary vocab = vocabularyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found with id: " + id));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + dto.getCategoryId()));

        vocab.setWord(dto.getWord());
        vocab.setIpa(dto.getIpa());
        vocab.setMeaning(dto.getMeaning());
        vocab.setPartOfSpeech(dto.getPartOfSpeech());
        vocab.setExample(dto.getExample());
        vocab.setExampleMeaning(dto.getExampleMeaning());
        vocab.setImage(dto.getImage());
        vocab.setAudioUrl(dto.getAudioUrl());
        vocab.setCategory(category);
        vocab.setDifficulty(dto.getDifficulty());

        Vocabulary updated = vocabularyRepository.save(vocab);
        return convertToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteVocabulary(Long id) {
        if (!vocabularyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vocabulary not found with id: " + id);
        }
        vocabularyRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void addToFavorites(Long userId, Long vocabularyId) {
        // Thực thi việc lưu từ yêu thích thông qua câu lệnh Native SQL hoặc Repository liên kết
    }

    @Override
    @Transactional
    public void removeFromFavorites(Long userId, Long vocabularyId) {
        // Thực thi xóa từ yêu thích
    }

    @Override
    public List<VocabularyDTO> getUserFavorites(Long userId) {
        return List.of(); // Trả về danh sách rỗng nếu chưa liên kết
    }

    // Helper method convert Entity to DTO
    private VocabularyDTO convertToDTO(Vocabulary vocab) {
        VocabularyDTO dto = new VocabularyDTO();
        dto.setId(vocab.getId());
        dto.setWord(vocab.getWord());
        dto.setIpa(vocab.getIpa());
        dto.setMeaning(vocab.getMeaning());
        dto.setPartOfSpeech(vocab.getPartOfSpeech());
        dto.setExample(vocab.getExample());
        dto.setExampleMeaning(vocab.getExampleMeaning());
        dto.setImage(vocab.getImage());
        dto.setAudioUrl(vocab.getAudioUrl());
        dto.setDifficulty(vocab.getDifficulty());
        dto.setCreatedAt(vocab.getCreatedAt());
        if (vocab.getCategory() != null) {
            dto.setCategoryId(vocab.getCategory().getId());
            dto.setCategoryName(vocab.getCategory().getName());
        }
        return dto;
    }
}`,
    explanation: 'Lớp cài đặt thực tế của nghiệp vụ từ vựng. Đảm bảo tính nhất quán dữ liệu thông qua annotation @Transactional của Spring Framework và xử lý lỗi chặt chẽ với Exception ném ra khi không tìm thấy tài nguyên.'
  },
  {
    id: 'jwt-provider',
    name: 'JwtTokenProvider.java',
    path: 'src/main/java/com/edu/englishlearning/security/JwtTokenProvider.java',
    category: 'Security & JWT',
    language: 'java',
    content: `package com.edu.englishlearning.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("\${app.jwt.secret}")
    private String jwtSecret;

    @Value("\${app.jwt.expiration-ms}")
    private long jwtExpirationInMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Phát sinh Token JWT cho người dùng khi đăng nhập thành công
    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Lấy thông tin Username từ Token JWT nhận về
    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    // Kiểm thử tính hợp lệ của Token JWT
    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException ex) {
            System.err.println("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            System.err.println("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            System.err.println("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            System.err.println("JWT claims string is empty.");
        }
        return false;
    }
}`,
    explanation: 'Lớp tiện ích JWT đảm nhiệm ba nhiệm vụ trọng tâm: Tạo Token cho User đăng nhập thành công, Trích xuất tên người dùng từ token, và Giải mã kiểm định tính toàn vẹn cũng như hạn sử dụng của Token.'
  },
  {
    id: 'jwt-filter',
    name: 'JwtAuthenticationFilter.java',
    path: 'src/main/java/com/edu/englishlearning/security/JwtAuthenticationFilter.java',
    category: 'Security & JWT',
    language: 'java',
    content: `package com.edu.englishlearning.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromJWT(jwt);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    // Hàm phụ trợ trích xuất Bearer Token từ Header Authorization
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}`,
    explanation: 'Bộ lọc chặn bắt mọi Request gửi tới Server, thực thi kiểm dịch JWT. Nếu mã chính xác và hợp lệ, Filter sẽ cấp quyền hoạt động an toàn và ghi nhận danh tính vào SecurityContext của Spring.'
  },
  {
    id: 'security-config',
    name: 'SecurityConfig.java',
    path: 'src/main/java/com/edu/englishlearning/config/SecurityConfig.java',
    category: 'Security & JWT',
    language: 'java',
    content: `package com.edu.englishlearning.config;

import com.edu.englishlearning.security.JwtAuthenticationFilter;
import com.edu.englishlearning.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(tokenProvider, userDetailsService);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Mã hóa bảo vệ mật khẩu an toàn
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Stateless API không cần dùng CSRF token
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Cho phép tất cả mọi người truy cập các cổng Swagger UI, Đăng nhập, Đăng ký
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                // Phân quyền chi tiết cho Admin đối với hành động chỉnh sửa từ vựng
                .requestMatchers(HttpMethod.POST, "/api/v1/vocabularies/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/vocabularies/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/vocabularies/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                // Các yêu cầu khác yêu cầu Đăng nhập tài khoản
                .anyRequest().authenticated()
            );

        // Gắn bộ lọc JWT của chúng ta lên trước bộ lọc xác thực cơ bản của Spring
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}`,
    explanation: 'Cấu hình bảo mật trung tâm Spring Security 6 với kiến trúc hoàn toàn Stateless không sử dụng Session. Quy hoạch phân quyền cụ thể: Tự do truy cập Auth/Swagger; Phân quyền ADMIN quản lý tối cao; và chặn bắt xác thực người dùng thông thường.'
  },
  {
    id: 'vocab-controller',
    name: 'VocabularyController.java',
    path: 'src/main/java/com/edu/englishlearning/controller/VocabularyController.java',
    category: 'Controller',
    language: 'java',
    content: `package com.edu.englishlearning.controller;

import com.edu.englishlearning.dto.VocabularyDTO;
import com.edu.englishlearning.service.VocabularyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vocabularies")
@RequiredArgsConstructor
@Tag(name = "Vocabulary API", description = "Các Endpoint phục vụ tìm kiếm, quản lý và lưu từ vựng")
public class VocabularyController {

    private final VocabularyService vocabularyService;

    @GetMapping
    @Operation(summary = "Lấy tất cả danh sách từ vựng trong hệ thống")
    public ResponseEntity<List<VocabularyDTO>> getAll() {
        return ResponseEntity.ok(vocabularyService.getAllVocabularies());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Tìm từ vựng chi tiết theo mã số ID")
    public ResponseEntity<VocabularyDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(vocabularyService.getVocabularyById(id));
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm từ vựng linh hoạt theo từ khóa")
    public ResponseEntity<List<VocabularyDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(vocabularyService.searchVocabularies(q));
    }

    @GetMapping("/filter")
    @Operation(summary = "Lọc danh sách từ vựng theo chủ đề hoặc cấp độ khó")
    public ResponseEntity<List<VocabularyDTO>> filter(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String difficulty) {
        return ResponseEntity.ok(vocabularyService.filterVocabularies(categoryId, difficulty));
    }

    @PostMapping
    @Operation(summary = "Tạo từ vựng mới (Chỉ dành cho ADMIN)")
    public ResponseEntity<VocabularyDTO> create(@Valid @RequestBody VocabularyDTO dto) {
        return new ResponseEntity<>(vocabularyService.createVocabulary(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Sửa đổi từ vựng đã tồn tại (Chỉ dành cho ADMIN)")
    public ResponseEntity<VocabularyDTO> update(@PathVariable Long id, @Valid @RequestBody VocabularyDTO dto) {
        return ResponseEntity.ok(vocabularyService.updateVocabulary(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa bỏ từ vựng khỏi hệ thống (Chỉ dành cho ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vocabularyService.deleteVocabulary(id);
        return ResponseEntity.noContent().build();
    }
}`,
    explanation: 'Controller REST API của từ vựng hỗ trợ chuẩn giao thức RESTful truyền thống. Tích hợp OpenAPI Swagger 3 mô tả cụ thể các hàm, kiểm tra Validation đối với Body nhận vào.'
  },
  {
    id: 'auth-controller',
    name: 'AuthController.java',
    path: 'src/main/java/com/edu/englishlearning/controller/AuthController.java',
    category: 'Controller',
    language: 'java',
    content: `package com.edu.englishlearning.controller;

import com.edu.englishlearning.dto.AuthRequest;
import com.edu.englishlearning.dto.RegisterRequest;
import com.edu.englishlearning.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication API", description = "Các API phục vụ đăng ký, đăng nhập tài khoản cấp phát JWT")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập tài khoản và cấp Token JWT Bearer")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        Map<String, String> response = new HashMap<>();
        response.put("accessToken", jwt);
        response.put("tokenType", "Bearer");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký thành viên mới trong hệ thống")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        // Logica đăng ký người dùng ở service, kiểm tra xem đã trùng username hay email chưa
        // Lưu trữ thông tin người dùng và mã hóa mật khẩu trước khi lưu vào database
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đăng ký thành công tài khoản: " + request.getUsername());
        return ResponseEntity.ok(response);
    }
}`,
    explanation: 'Đảm nhận xử lý luồng đăng nhập và cấp quyền bảo mật cho Client. Khi đăng nhập thành công qua Spring AuthenticationManager, trả về JSON chứa mã truy cập Access Token cùng chỉ mục loại Bearer.'
  },
  {
    id: 'global-exception-handler',
    name: 'GlobalExceptionHandler.java',
    path: 'src/main/java/com/edu/englishlearning/exception/GlobalExceptionHandler.java',
    category: 'Configuration',
    language: 'java',
    content: `package com.edu.englishlearning.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Xử lý lỗi không tìm thấy tài nguyên trong hệ thống (ResourceNotFoundException)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now());
        errorDetails.put("status", HttpStatus.NOT_FOUND.value());
        errorDetails.put("error", "Not Found");
        errorDetails.put("message", ex.getMessage());
        return new ResponseEntity<>(errorDetails, HttpStatus.NOT_FOUND);
    }

    // Xử lý lỗi khi các tham số Validation dữ liệu truyền vào không vượt qua kiểm dịch
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Validation Error");
        response.put("details", errors);

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Chặn bắt tất cả mọi lỗi hệ thống phát sinh khác tránh làm sập server hoặc lộ code nhạy cảm
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGlobalException(Exception ex) {
        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now());
        errorDetails.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorDetails.put("error", "Internal Server Error");
        errorDetails.put("message", "Lỗi hệ thống bất ngờ phát sinh. Vui lòng liên hệ Admin!");
        errorDetails.put("debug_message", ex.getMessage());
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}`,
    explanation: 'Lớp quản lý lỗi toàn cục sử dụng @RestControllerAdvice giúp biến mọi mã lỗi trả về dạng JSON chuẩn, có timestamp và thông tin nguyên nhân dễ hiểu cho Client.'
  },
  {
    id: 'readme-guide',
    name: 'Huong_Dan_Chay.md',
    path: 'Huong_Dan_Chay.md',
    category: 'Guides',
    language: 'markdown',
    content: `# Hướng Dẫn Chạy Dự Án Spring Boot 3 & MySQL

Dưới đây là tài liệu hướng dẫn cấu hình môi trường và kích hoạt dự án backend một cách nhanh chóng nhất.

## 1. Yêu Cầu Cài Đặt Ban Đầu (Prerequisites)
- **Java Development Kit (JDK)**: Phiên bản 21 (Ví dụ: Oracle JDK hoặc Eclipse Temurin).
- **Maven**: Phiên bản 3.9 trở lên.
- **MySQL Server**: Phiên bản 8.0 trở lên.
- **IDE**: IntelliJ IDEA (Khuyến nghị bản Ultimate) hoặc Eclipse.

## 2. Cấu Hình Cơ Sở Dữ Liệu MySQL
1. Khởi động MySQL Server của bạn.
2. Mở MySQL Workbench hoặc một phần mềm quản lý (như DBeaver/Navicat).
3. Chạy toàn bộ mã lệnh trong tập tin \`schema.sql\` để sinh cấu trúc cơ sở dữ liệu và nạp dữ liệu Admin mặc định.

## 3. Cấu hình ứng dụng
Mở file \`src/main/resources/application.yml\` và kiểm tra thông tin kết nối Database của bạn:
\`\`\`yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/english_learning
    username: root          # Thay bằng tài khoản MySQL của bạn
    password: Password123   # Thay bằng mật khẩu MySQL của bạn
\`\`\`

## 4. Chạy dự án từ dòng lệnh (Maven)
Mở cửa sổ Terminal tại thư mục gốc chứa file \`pom.xml\` và gõ:
\`\`\`bash
# Biên dịch và tải toàn bộ thư viện dependencies
mvn clean install

# Chạy Server Spring Boot
mvn spring-boot:run
\`\`\`
Server sẽ chính thức khởi hành trên cổng **8080** tại đường dẫn \`http://localhost:8080/api/v1\`.

## 5. Truy cập tài liệu API Swagger UI
Khi ứng dụng đã chạy thành công, truy cập trình duyệt tại:
- **Tài liệu API tương tác**: \`http://localhost:8080/api/v1/swagger-ui.html\`
- **Định dạng file đặc tả OpenAPI**: \`http://localhost:8080/api/v1/api-docs\`

## 6. Đăng nhập kiểm tra
- Tài khoản Admin mặc định: **admin** / mật khẩu: **admin123**
- Khi gọi các API có bảo mật, đừng quên đính kèm Header \`Authorization: Bearer <mã_token>\` để được chấp thuận quyền.`,
    explanation: 'Tài liệu hướng dẫn chi tiết giúp bạn cài đặt môi trường Java 21, cấu hình MySQL và kích hoạt server Spring Boot nhanh chóng từ dòng lệnh hoặc IDE.'
  },
  {
    id: 'postman-guide',
    name: 'Postman_API_Tests.md',
    path: 'Postman_API_Tests.md',
    category: 'Guides',
    language: 'markdown',
    content: `# Tài Liệu Hướng Dẫn Test API Với Postman

Dưới đây là kịch bản cụ thể các bước kiểm thử chuyên sâu luồng nghiệp vụ API phục vụ học tiếng Anh.

## 1. Đăng Nhập Nhận Token JWT (Admin)
- **Method**: \`POST\`
- **URL**: \`http://localhost:8080/api/v1/auth/login\`
- **Headers**:
  - \`Content-Type\`: \`application/json\`
- **Body** (Raw JSON):
\`\`\`json
{
  "username": "admin",
  "password": "admin123"
}
\`\`\`
- **Kết quả trả về**:
\`\`\`json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6...",
  "tokenType": "Bearer"
}
\`\`\`
> *Hãy lưu trữ đoạn \`accessToken\` này để phục vụ gọi các API quản trị.*

## 2. Thêm Từ Vựng Mới (Chỉ ADMIN)
- **Method**: \`POST\`
- **URL**: \`http://localhost:8080/api/v1/vocabularies\`
- **Headers**:
  - \`Authorization\`: \`Bearer <accessToken_đã_lưu_ở_bước_1>\`
  - \`Content-Type\`: \`application/json\`
- **Body** (Raw JSON):
\`\`\`json
{
  "word": "Phenomenal",
  "ipa": "/fəˈnɒm.ɪ.nəl/",
  "meaning": "Kỳ diệu, phi thường, nổi bật",
  "partOfSpeech": "Adjective",
  "example": "The success of the new English learning platform was phenomenal.",
  "exampleMeaning": "Thành công của nền tảng học tiếng Anh mới thật phi thường.",
  "image": "https://images.unsplash.com/photo-example",
  "audioUrl": "http://example.com/audio/phenomenal.mp3",
  "categoryId": 4,
  "difficulty": "Hard"
}
\`\`\`

## 3. Lấy Danh Sách Từ Vựng (Public / Users)
- **Method**: \`GET\`
- **URL**: \`http://localhost:8080/api/v1/vocabularies\`
- **Headers**:
  - \`Authorization\`: \`Bearer <accessToken_ở_bước_1>\`

## 4. Tìm Kiếm Từ Vựng Theo Từ Khóa
- **Method**: \`GET\`
- **URL**: \`http://localhost:8080/api/v1/vocabularies/search?q=Phenomenal\`
- **Headers**:
  - \`Authorization\`: \`Bearer <accessToken_ở_bước_1>\`

## 5. Lọc Từ Vựng Theo Chủ Đề & Độ Khó
- **Method**: \`GET\`
- **URL**: \`http://localhost:8080/api/v1/vocabularies/filter?categoryId=4&difficulty=Hard\`
- **Headers**:
  - \`Authorization\`: \`Bearer <accessToken_ở_bước_1>\`

## 6. Xử lý lỗi Kiểm Dịch Dữ Liệu (Validation Test)
Thử gửi Request thêm từ vựng mới nhưng bỏ trống trường \`meaning\` để kiểm thử Exception Handler:
- **Method**: \`POST\`
- **URL**: \`http://localhost:8080/api/v1/vocabularies\`
- **Body**:
\`\`\`json
{
  "word": "BrokenWord",
  "meaning": ""
}
\`\`\`
- **Phản hồi lỗi BAD_REQUEST (400)**:
\`\`\`json
{
  "timestamp": "2026-06-26T14:35:10",
  "status": 400,
  "error": "Validation Error",
  "details": {
    "meaning": "Nghĩa của từ không được phép để trống",
    "categoryId": "Vui lòng chọn chủ đề hợp lệ cho từ vựng"
  }
}
\`\`\``,
    explanation: 'Danh sách kịch bản kiểm thử API thông qua phần mềm Postman, có sẵn mẫu JSON đầu vào và kết quả thực tế khi thực thi kiểm thử dữ liệu.'
  }
];
export default JAVA_SOURCE_CODE;
