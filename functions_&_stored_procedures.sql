--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.8

-- Started on 2025-08-14 22:28:14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 895 (class 1247 OID 103502)
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DiscountType" AS ENUM (
    'product',
    'shipping'
);


--
-- TOC entry 252 (class 1255 OID 57509)
-- Name: create_comment(integer, integer, text, integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.create_comment(IN p_review_id integer, IN p_member_id integer, IN p_content text, IN p_parent_comment_id integer DEFAULT NULL::integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM review WHERE review_id = p_review_id) THEN
        RAISE EXCEPTION 'Review % does not exist', p_review_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM member WHERE id = p_member_id) THEN
        RAISE EXCEPTION 'Member % does not exist', p_member_id;
    END IF;

    IF p_parent_comment_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM comment WHERE comment_id = p_parent_comment_id
    ) THEN
        RAISE EXCEPTION 'Parent comment % does not exist', p_parent_comment_id;
    END IF;

    IF TRIM(p_content) = '' THEN
        RAISE EXCEPTION 'Comment content cannot be empty';
    END IF;

    INSERT INTO comment (review_id, member_id, parent_comment_id, content)
    VALUES (p_review_id, p_member_id, p_parent_comment_id, p_content);
END;
$$;


--
-- TOC entry 238 (class 1255 OID 57505)
-- Name: create_review(integer, integer, integer, text, integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.create_review(IN p_member_id integer, IN p_product_id integer, IN p_order_id integer, IN p_content text, IN p_rating integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM member WHERE id = p_member_id) THEN
        RAISE EXCEPTION 'Member % does not exist', p_member_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM product WHERE id = p_product_id) THEN
        RAISE EXCEPTION 'Product % does not exist', p_product_id;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM sale_order WHERE id = p_order_id) THEN
        RAISE EXCEPTION 'Order % does not exist', p_order_id;
    END IF;

    IF p_rating < 1 OR p_rating > 5 THEN
        RAISE EXCEPTION 'Rating must be between 1 and 5';
    END IF;

    IF TRIM(p_content) = '' THEN
        RAISE EXCEPTION 'Review content cannot be empty';
    END IF;

    INSERT INTO review (member_id, product_id, order_id, content, rating)
    VALUES (p_member_id, p_product_id, p_order_id, p_content, p_rating);
END;
$$;


--
-- TOC entry 253 (class 1255 OID 57511)
-- Name: delete_comment(integer, integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.delete_comment(IN p_comment_id integer, IN p_member_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM comment WHERE comment_id = p_comment_id AND member_id = p_member_id
    ) THEN
        RAISE EXCEPTION 'Comment % not found for member %', p_comment_id, p_member_id;
    END IF;

    DELETE FROM comment WHERE comment_id = p_comment_id;
END;
$$;


--
-- TOC entry 240 (class 1255 OID 57507)
-- Name: delete_review(integer, integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.delete_review(IN p_review_id integer, IN p_member_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM review WHERE review_id = p_review_id AND member_id = p_member_id
    ) THEN
        RAISE EXCEPTION 'Review % not found for member %', p_review_id, p_member_id;
    END IF;

    DELETE FROM review WHERE review_id = p_review_id;
END;
$$;


--
-- TOC entry 255 (class 1255 OID 57522)
-- Name: get_comments(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_comments(p_review_id integer) RETURNS TABLE(comment_id integer, member_id integer, username character varying, parent_comment_id integer, content text, created_at timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.comment_id,
        c.member_id,
        m.username,
        c.parent_comment_id,
        c.content,
        c.created_at
    FROM comment c
    JOIN member m ON c.member_id = m.id
    WHERE c.review_id = p_review_id
    ORDER BY c.created_at;
END;
$$;


--
-- TOC entry 254 (class 1255 OID 57517)
-- Name: get_reviews(integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_reviews(p_id integer, p_type text) RETURNS TABLE(reviewid integer, productid integer, productname text, orderid integer, content text, rating integer, createdat timestamp without time zone, username text)
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF p_type = 'member' THEN
    RETURN QUERY
    SELECT
      r.review_id,
      r.product_id,
      p.name::TEXT,
      r.order_id,
      r.content,
      r.rating,
      r.created_at,
      m.username::TEXT     
    FROM review r
    JOIN product p ON r.product_id = p.id
    JOIN member m ON r.member_id = m.id
    WHERE r.member_id = p_id
    ORDER BY r.created_at DESC;

  ELSIF p_type = 'product' THEN
    RETURN QUERY
    SELECT
      r.review_id,
      r.product_id,
      p.name::TEXT,
      r.order_id,
      r.content,
      r.rating,
      r.created_at,
      m.username::TEXT     
    FROM review r
    JOIN product p ON r.product_id = p.id
    JOIN member m ON r.member_id = m.id
    WHERE r.product_id = p_id
    ORDER BY r.created_at DESC;
  END IF;
END;
$$;


--
-- TOC entry 256 (class 1255 OID 73739)
-- Name: get_sale_order_summary(character varying, character varying, date, date, character varying, numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_sale_order_summary(gender_filter character varying, product_type_filter character varying, min_date date, max_date date, sort_by character varying, min_total_spending numeric, min_member_total_spending numeric) RETURNS TABLE(product_type character varying, gender character varying, age_group character varying, total_orders integer, total_quantity numeric, total_spending numeric, avg_order_value numeric)
    LANGUAGE plpgsql
    AS $_$
DECLARE
    safe_sort_by varchar := 'total_spending';
BEGIN
    -- Validate sort_by input to avoid SQL injection & errors
    IF sort_by IS NOT NULL AND sort_by IN ('total_spending', 'total_orders', 'total_quantity', 'avg_order_value') THEN
        safe_sort_by := sort_by;
    END IF;

    RETURN QUERY EXECUTE format(
        $SQL$
        WITH member_spending AS (
            SELECT
                p.product_type,
                m.gender,
                CASE
                    WHEN EXTRACT(YEAR FROM AGE(current_date, m.dob)) < 19 THEN '<19'
                    WHEN EXTRACT(YEAR FROM AGE(current_date, m.dob)) BETWEEN 19 AND 29 THEN '19-29'
                    WHEN EXTRACT(YEAR FROM AGE(current_date, m.dob)) BETWEEN 30 AND 39 THEN '30-39'
                    WHEN EXTRACT(YEAR FROM AGE(current_date, m.dob)) BETWEEN 40 AND 49 THEN '40-49'
                    ELSE '50+'
                END AS age_group,
                so.member_id,
                SUM(soi.quantity * p.unit_price) AS member_spending_total
            FROM sale_order so
            JOIN member m ON so.member_id = m.id
            JOIN sale_order_item soi ON so.id = soi.sale_order_id
            JOIN product p ON soi.product_id = p.id
            WHERE
                (%L IS NULL OR m.gender = %L) AND
                (%L IS NULL OR p.product_type = %L) AND
                (so.order_datetime >= %L OR %L IS NULL) AND
                (so.order_datetime <= %L OR %L IS NULL)
            GROUP BY p.product_type, m.gender, age_group, so.member_id
        ),
        groups AS (
            SELECT
                p.product_type,
                m.gender,
                CASE
                    WHEN EXTRACT(YEAR FROM AGE(current_date, m.dob)) < 19 THEN '<19'
                    WHEN EXTRACT(YEAR FROM AGE(current_date, m.dob)) BETWEEN 19 AND 29 THEN '19-29'
                    WHEN EXTRACT(YEAR FROM AGE(current_date, m.dob)) BETWEEN 30 AND 39 THEN '30-39'
                    WHEN EXTRACT(YEAR FROM AGE(current_date, m.dob)) BETWEEN 40 AND 49 THEN '40-49'
                    ELSE '50+'
                END AS age_group,
                COUNT(DISTINCT so.id) AS total_orders,
                SUM(soi.quantity) AS total_quantity,
                SUM(soi.quantity * p.unit_price) AS total_spending,
                ROUND(AVG(order_totals.total_amount), 2) AS avg_order_value
            FROM sale_order so
            JOIN member m ON so.member_id = m.id
            JOIN sale_order_item soi ON so.id = soi.sale_order_id
            JOIN product p ON soi.product_id = p.id
            JOIN (
                SELECT sale_order_id, SUM(quantity * p2.unit_price) AS total_amount
                FROM sale_order_item soi2
                JOIN product p2 ON soi2.product_id = p2.id
                GROUP BY sale_order_id
            ) order_totals ON order_totals.sale_order_id = so.id
            WHERE
                (%L IS NULL OR m.gender = %L) AND
                (%L IS NULL OR p.product_type = %L) AND
                (so.order_datetime >= %L OR %L IS NULL) AND
                (so.order_datetime <= %L OR %L IS NULL)
            GROUP BY p.product_type, m.gender, age_group
        )
        SELECT
            g.product_type::varchar,
            g.gender::varchar,
            g.age_group::varchar,
            g.total_orders::integer,
            g.total_quantity::numeric,
            g.total_spending::numeric,
            g.avg_order_value::numeric
        FROM groups g
        WHERE g.total_spending >= %L
          AND NOT EXISTS (
              SELECT 1 FROM member_spending ms
              WHERE ms.product_type = g.product_type
                AND ms.gender = g.gender
                AND ms.age_group = g.age_group
                AND ms.member_spending_total < %L
          )
        ORDER BY %I DESC
        $SQL$,
        gender_filter, gender_filter,
        product_type_filter, product_type_filter,
        min_date, min_date,
        max_date, max_date,
        gender_filter, gender_filter,
        product_type_filter, product_type_filter,
        min_date, min_date,
        max_date, max_date,
        min_total_spending,
        min_member_total_spending,
        safe_sort_by
    );
END;
$_$;


--
-- TOC entry 257 (class 1255 OID 103580)
-- Name: place_orders(integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.place_orders(IN p_member_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    cart_rec RECORD;
    order_id INT;
BEGIN
    -- Create one sale_order for the entire cart
    INSERT INTO sale_order(member_id, order_datetime, status)
    VALUES (p_member_id, NOW(), 'PACKING')
    RETURNING id INTO order_id;

    FOR cart_rec IN
        SELECT ci.id AS cart_item_id, ci.product_id, ci.quantity, p.stock_quantity
        FROM cart_item ci
        JOIN cart c ON ci.cart_id = c.id
        JOIN product p ON ci.product_id = p.id
        WHERE c.member_id = p_member_id
    LOOP
        IF cart_rec.stock_quantity >= cart_rec.quantity THEN
            -- Deduct stock
            UPDATE product
            SET stock_quantity = stock_quantity - cart_rec.quantity
            WHERE id = cart_rec.product_id;

            -- Add item to sale_order_item
            INSERT INTO sale_order_item(sale_order_id, product_id, quantity)
            VALUES (order_id, cart_rec.product_id, cart_rec.quantity);

            -- Remove item from cart
            DELETE FROM cart_item WHERE id = cart_rec.cart_item_id;
        END IF;
    END LOOP;
END;
$$;


--
-- TOC entry 239 (class 1255 OID 57506)
-- Name: update_review(integer, integer, text, integer); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.update_review(IN p_review_id integer, IN p_member_id integer, IN p_new_content text, IN p_new_rating integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM review WHERE review_id = p_review_id AND member_id = p_member_id
    ) THEN
        RAISE EXCEPTION 'Review % not found for member %', p_review_id, p_member_id;
    END IF;

    IF TRIM(p_new_content) = '' THEN
        RAISE EXCEPTION 'Review content cannot be empty';
    END IF;

    IF p_new_rating < 1 OR p_new_rating > 5 THEN
        RAISE EXCEPTION 'Rating must be between 1 and 5';
    END IF;

    UPDATE review
    SET content = p_new_content,
        rating = p_new_rating
    WHERE review_id = p_review_id;
END;
$$;


--
-- TOC entry 229 (class 1259 OID 103022)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 103508)
-- Name: cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart (
    id integer NOT NULL,
    member_id integer NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- TOC entry 236 (class 1259 OID 103533)
-- Name: cart_discount; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_discount (
    "cartId" integer NOT NULL,
    "discountId" integer NOT NULL
);


--
-- TOC entry 230 (class 1259 OID 103507)
-- Name: cart_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 230
-- Name: cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_id_seq OWNED BY public.cart.id;


--
-- TOC entry 233 (class 1259 OID 103516)
-- Name: cart_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_item (
    id integer NOT NULL,
    cart_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity numeric NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 103515)
-- Name: cart_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4972 (class 0 OID 0)
-- Dependencies: 232
-- Name: cart_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_item_id_seq OWNED BY public.cart_item.id;


--
-- TOC entry 228 (class 1259 OID 57474)
-- Name: comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment (
    comment_id integer NOT NULL,
    review_id integer NOT NULL,
    member_id integer NOT NULL,
    parent_comment_id integer,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 227 (class 1259 OID 57473)
-- Name: comment_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comment_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4973 (class 0 OID 0)
-- Dependencies: 227
-- Name: comment_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comment_comment_id_seq OWNED BY public.comment.comment_id;


--
-- TOC entry 235 (class 1259 OID 103525)
-- Name: discount; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discount (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    type public."DiscountType" NOT NULL,
    value numeric NOT NULL,
    expires_at timestamp(6) without time zone
);


--
-- TOC entry 234 (class 1259 OID 103524)
-- Name: discount_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.discount_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4974 (class 0 OID 0)
-- Dependencies: 234
-- Name: discount_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.discount_id_seq OWNED BY public.discount.id;


--
-- TOC entry 215 (class 1259 OID 57382)
-- Name: member; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(50) NOT NULL,
    dob date NOT NULL,
    password character varying(255) NOT NULL,
    role integer NOT NULL,
    gender character(1) NOT NULL
);


--
-- TOC entry 216 (class 1259 OID 57385)
-- Name: member_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4975 (class 0 OID 0)
-- Dependencies: 216
-- Name: member_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_id_seq OWNED BY public.member.id;


--
-- TOC entry 217 (class 1259 OID 57386)
-- Name: member_role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_role (
    id integer NOT NULL,
    name character varying(25)
);


--
-- TOC entry 218 (class 1259 OID 57389)
-- Name: member_role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4976 (class 0 OID 0)
-- Dependencies: 218
-- Name: member_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_role_id_seq OWNED BY public.member_role.id;


--
-- TOC entry 237 (class 1259 OID 103538)
-- Name: order_discount; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_discount (
    "orderId" integer NOT NULL,
    "discountId" integer NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 57390)
-- Name: product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product (
    id integer NOT NULL,
    name character varying(255),
    description text,
    unit_price numeric NOT NULL,
    stock_quantity numeric DEFAULT 0 NOT NULL,
    country character varying(100),
    product_type character varying(50),
    image_url character varying(255) DEFAULT '/images/product.png'::character varying,
    manufactured_on timestamp without time zone
);


--
-- TOC entry 220 (class 1259 OID 57397)
-- Name: product_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4977 (class 0 OID 0)
-- Dependencies: 220
-- Name: product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_id_seq OWNED BY public.product.id;


--
-- TOC entry 226 (class 1259 OID 57448)
-- Name: review; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review (
    review_id integer NOT NULL,
    member_id integer NOT NULL,
    product_id integer NOT NULL,
    order_id integer NOT NULL,
    content text NOT NULL,
    rating integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT review_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- TOC entry 225 (class 1259 OID 57447)
-- Name: review_review_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4978 (class 0 OID 0)
-- Dependencies: 225
-- Name: review_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_review_id_seq OWNED BY public.review.review_id;


--
-- TOC entry 221 (class 1259 OID 57398)
-- Name: sale_order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_order (
    id integer NOT NULL,
    member_id integer,
    order_datetime timestamp without time zone NOT NULL,
    status character varying(10)
);


--
-- TOC entry 222 (class 1259 OID 57401)
-- Name: sale_order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sale_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4979 (class 0 OID 0)
-- Dependencies: 222
-- Name: sale_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sale_order_id_seq OWNED BY public.sale_order.id;


--
-- TOC entry 223 (class 1259 OID 57402)
-- Name: sale_order_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_order_item (
    id integer NOT NULL,
    sale_order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity numeric NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 57407)
-- Name: sale_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sale_order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4980 (class 0 OID 0)
-- Dependencies: 224
-- Name: sale_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sale_order_item_id_seq OWNED BY public.sale_order_item.id;


--
-- TOC entry 4770 (class 2604 OID 103511)
-- Name: cart id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart ALTER COLUMN id SET DEFAULT nextval('public.cart_id_seq'::regclass);


--
-- TOC entry 4772 (class 2604 OID 103519)
-- Name: cart_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item ALTER COLUMN id SET DEFAULT nextval('public.cart_item_id_seq'::regclass);


--
-- TOC entry 4766 (class 2604 OID 57477)
-- Name: comment comment_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment ALTER COLUMN comment_id SET DEFAULT nextval('public.comment_comment_id_seq'::regclass);


--
-- TOC entry 4773 (class 2604 OID 103528)
-- Name: discount id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount ALTER COLUMN id SET DEFAULT nextval('public.discount_id_seq'::regclass);


--
-- TOC entry 4757 (class 2604 OID 57408)
-- Name: member id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member ALTER COLUMN id SET DEFAULT nextval('public.member_id_seq'::regclass);


--
-- TOC entry 4758 (class 2604 OID 57409)
-- Name: member_role id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_role ALTER COLUMN id SET DEFAULT nextval('public.member_role_id_seq'::regclass);


--
-- TOC entry 4759 (class 2604 OID 57410)
-- Name: product id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product ALTER COLUMN id SET DEFAULT nextval('public.product_id_seq'::regclass);


--
-- TOC entry 4764 (class 2604 OID 57451)
-- Name: review review_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review ALTER COLUMN review_id SET DEFAULT nextval('public.review_review_id_seq'::regclass);


--
-- TOC entry 4762 (class 2604 OID 57411)
-- Name: sale_order id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_order ALTER COLUMN id SET DEFAULT nextval('public.sale_order_id_seq'::regclass);


--
-- TOC entry 4763 (class 2604 OID 57412)
-- Name: sale_order_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_order_item ALTER COLUMN id SET DEFAULT nextval('public.sale_order_item_id_seq'::regclass);


--
-- TOC entry 4794 (class 2606 OID 103030)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4803 (class 2606 OID 103537)
-- Name: cart_discount cart_discount_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_discount
    ADD CONSTRAINT cart_discount_pkey PRIMARY KEY ("cartId", "discountId");


--
-- TOC entry 4798 (class 2606 OID 103523)
-- Name: cart_item cart_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4796 (class 2606 OID 103514)
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- TOC entry 4792 (class 2606 OID 57482)
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (comment_id);


--
-- TOC entry 4801 (class 2606 OID 103532)
-- Name: discount discount_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discount
    ADD CONSTRAINT discount_pkey PRIMARY KEY (id);


--
-- TOC entry 4776 (class 2606 OID 57414)
-- Name: member member_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member
    ADD CONSTRAINT member_email_key UNIQUE (email);


--
-- TOC entry 4778 (class 2606 OID 57416)
-- Name: member member_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (id);


--
-- TOC entry 4782 (class 2606 OID 57418)
-- Name: member_role member_role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_role
    ADD CONSTRAINT member_role_pkey PRIMARY KEY (id);


--
-- TOC entry 4780 (class 2606 OID 57420)
-- Name: member member_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member
    ADD CONSTRAINT member_username_key UNIQUE (username);


--
-- TOC entry 4805 (class 2606 OID 103542)
-- Name: order_discount order_discount_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_discount
    ADD CONSTRAINT order_discount_pkey PRIMARY KEY ("orderId", "discountId");


--
-- TOC entry 4784 (class 2606 OID 57422)
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- TOC entry 4790 (class 2606 OID 57457)
-- Name: review review_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_pkey PRIMARY KEY (review_id);


--
-- TOC entry 4788 (class 2606 OID 57424)
-- Name: sale_order_item sale_order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_order_item
    ADD CONSTRAINT sale_order_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4786 (class 2606 OID 57426)
-- Name: sale_order sale_order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_order
    ADD CONSTRAINT sale_order_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 1259 OID 103543)
-- Name: discount_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX discount_code_key ON public.discount USING btree (code);


--
-- TOC entry 4819 (class 2606 OID 103559)
-- Name: cart_discount cart_discount_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_discount
    ADD CONSTRAINT "cart_discount_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public.cart(id) ON DELETE CASCADE;


--
-- TOC entry 4820 (class 2606 OID 103564)
-- Name: cart_discount cart_discount_discountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_discount
    ADD CONSTRAINT "cart_discount_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES public.discount(id) ON DELETE CASCADE;


--
-- TOC entry 4817 (class 2606 OID 103549)
-- Name: cart_item cart_item_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.cart(id) ON DELETE CASCADE;


--
-- TOC entry 4818 (class 2606 OID 103554)
-- Name: cart_item cart_item_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_item
    ADD CONSTRAINT cart_item_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id);


--
-- TOC entry 4816 (class 2606 OID 103544)
-- Name: cart cart_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.member(id) ON DELETE CASCADE;


--
-- TOC entry 4813 (class 2606 OID 57488)
-- Name: comment comment_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.member(id);


--
-- TOC entry 4814 (class 2606 OID 57493)
-- Name: comment comment_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comment(comment_id);


--
-- TOC entry 4815 (class 2606 OID 57483)
-- Name: comment comment_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.review(review_id);


--
-- TOC entry 4806 (class 2606 OID 57427)
-- Name: member fk_member_role_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member
    ADD CONSTRAINT fk_member_role_id FOREIGN KEY (role) REFERENCES public.member_role(id);


--
-- TOC entry 4808 (class 2606 OID 57432)
-- Name: sale_order_item fk_sale_order_item_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_order_item
    ADD CONSTRAINT fk_sale_order_item_product FOREIGN KEY (product_id) REFERENCES public.product(id);


--
-- TOC entry 4809 (class 2606 OID 57437)
-- Name: sale_order_item fk_sale_order_item_sale_order; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_order_item
    ADD CONSTRAINT fk_sale_order_item_sale_order FOREIGN KEY (sale_order_id) REFERENCES public.sale_order(id);


--
-- TOC entry 4807 (class 2606 OID 57442)
-- Name: sale_order fk_sale_order_member; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_order
    ADD CONSTRAINT fk_sale_order_member FOREIGN KEY (member_id) REFERENCES public.member(id);


--
-- TOC entry 4821 (class 2606 OID 103574)
-- Name: order_discount order_discount_discountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_discount
    ADD CONSTRAINT "order_discount_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES public.discount(id) ON DELETE CASCADE;


--
-- TOC entry 4822 (class 2606 OID 103569)
-- Name: order_discount order_discount_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_discount
    ADD CONSTRAINT "order_discount_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.sale_order(id) ON DELETE CASCADE;


--
-- TOC entry 4810 (class 2606 OID 57458)
-- Name: review review_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.member(id);


--
-- TOC entry 4811 (class 2606 OID 57468)
-- Name: review review_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.sale_order(id);


--
-- TOC entry 4812 (class 2606 OID 57463)
-- Name: review review_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id);


-- Completed on 2025-08-14 22:28:14

--
-- PostgreSQL database dump complete
--

