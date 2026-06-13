export type Task = {
  id: number;
  title: string;
  difficulty: "medium" | "complex";
  description: string;
  concepts: string[];
  requirements: string[];
};

export type Step = {
  title: string;
  sub: string;
  concepts: string[];
  body: string; // HTML string
  gotcha?: string;
  note?: string;
  good?: string;
};

export type Day = {
  day: number;
  title: string;
  subtitle: string;
  phase: number;
  concepts: string[];
  steps: Step[];
  tasks: Task[];
};

export const phases = [
  { id: 1, name: "Intermediate foundations", days: [1, 14] },
  { id: 2, name: "Advanced concurrency & internals", days: [15, 28] },
  { id: 3, name: "Systems & performance", days: [29, 42] },
  { id: 4, name: "Expert patterns & architecture", days: [43, 56] },
  { id: 5, name: "Capstone & mastery", days: [57, 60] },
];

export const days: Day[] = [
  {
    day: 1,
    title: "Interfaces & composition",
    subtitle: "Implicit satisfaction, method sets, embedding, nil gotcha",
    phase: 1,
    concepts: ["implicit interfaces", "method sets", "interface composition", "struct embedding", "nil interface gotcha"],
    steps: [
      {
        title: "Interfaces are implicit",
        sub: "No 'implements' keyword — a type satisfies an interface simply by having the right methods.",
        concepts: ["implicit interfaces"],
        body: `<pre><code><span class="kw">type</span> <span class="ty">Stringer</span> <span class="kw">interface</span> {
    <span class="fn">String</span>() <span class="ty">string</span>
}

<span class="kw">type</span> <span class="ty">User</span> <span class="kw">struct</span> {
    Name  <span class="ty">string</span>
    Email <span class="ty">string</span>
}

<span class="cm">// User satisfies Stringer — no declaration needed</span>
<span class="kw">func</span> (u <span class="ty">User</span>) <span class="fn">String</span>() <span class="ty">string</span> {
    <span class="kw">return</span> u.Name + <span class="str">" &lt;"</span> + u.Email + <span class="str">"&gt;"</span>
}</code></pre>`,
        note: "This is called structural typing. The interface and the type don't need to know about each other — any package can define an interface that any other package's type satisfies.",
      },
      {
        title: "Method sets",
        sub: "Whether you use a value receiver or pointer receiver matters for interface satisfaction.",
        concepts: ["method sets"],
        body: `<pre><code><span class="kw">type</span> <span class="ty">Writer</span> <span class="kw">interface</span> {
    <span class="fn">Write</span>([]<span class="ty">byte</span>) (<span class="ty">int</span>, <span class="ty">error</span>)
}

<span class="kw">type</span> <span class="ty">Buffer</span> <span class="kw">struct</span> { data []<span class="ty">byte</span> }

<span class="cm">// pointer receiver — only *Buffer satisfies Writer</span>
<span class="kw">func</span> (b *<span class="ty">Buffer</span>) <span class="fn">Write</span>(p []<span class="ty">byte</span>) (<span class="ty">int</span>, <span class="ty">error</span>) {
    b.data = <span class="fn">append</span>(b.data, p...)
    <span class="kw">return</span> <span class="fn">len</span>(p), <span class="kw">nil</span>
}

<span class="kw">var</span> w <span class="ty">Writer</span> = &<span class="ty">Buffer</span>{}   <span class="cm">// ok</span>
<span class="kw">var</span> w <span class="ty">Writer</span> = <span class="ty">Buffer</span>{}    <span class="cm">// compile error!</span></code></pre>`,
        gotcha: "Rule of thumb: if your method mutates the receiver, use a pointer receiver. If it only reads, a value receiver is fine. Be consistent within a type.",
      },
      {
        title: "Interface composition",
        sub: "Build larger interfaces from smaller ones — Go's stdlib is full of this pattern.",
        concepts: ["interface composition"],
        body: `<pre><code><span class="kw">type</span> <span class="ty">Reader</span> <span class="kw">interface</span> {
    <span class="fn">Read</span>(p []<span class="ty">byte</span>) (<span class="ty">int</span>, <span class="ty">error</span>)
}

<span class="kw">type</span> <span class="ty">Writer</span> <span class="kw">interface</span> {
    <span class="fn">Write</span>(p []<span class="ty">byte</span>) (<span class="ty">int</span>, <span class="ty">error</span>)
}

<span class="cm">// Compose them — io.ReadWriter from stdlib</span>
<span class="kw">type</span> <span class="ty">ReadWriter</span> <span class="kw">interface</span> {
    <span class="ty">Reader</span>
    <span class="ty">Writer</span>
}

<span class="cm">// Accept the smallest interface you need</span>
<span class="kw">func</span> <span class="fn">Copy</span>(dst <span class="ty">Writer</span>, src <span class="ty">Reader</span>) <span class="ty">error</span> { <span class="cm">/* ... */</span> }</code></pre>`,
        note: "Accept interfaces, return structs. Functions should accept the narrowest interface they need, making them easier to test and reuse.",
      },
      {
        title: "Struct embedding",
        sub: "Embedding promotes methods from an inner type — Go's answer to inheritance.",
        concepts: ["struct embedding"],
        body: `<pre><code><span class="kw">type</span> <span class="ty">Animal</span> <span class="kw">struct</span> { Name <span class="ty">string</span> }

<span class="kw">func</span> (a <span class="ty">Animal</span>) <span class="fn">Describe</span>() <span class="ty">string</span> {
    <span class="kw">return</span> <span class="str">"I am "</span> + a.Name
}

<span class="kw">type</span> <span class="ty">Dog</span> <span class="kw">struct</span> {
    <span class="ty">Animal</span>           <span class="cm">// embedded — no field name</span>
    Breed <span class="ty">string</span>
}

d := <span class="ty">Dog</span>{Animal: <span class="ty">Animal</span>{Name: <span class="str">"Rex"</span>}, Breed: <span class="str">"Lab"</span>}
d.<span class="fn">Describe</span>()   <span class="cm">// promoted — "I am Rex"</span>
d.Name         <span class="cm">// also promoted</span></code></pre>`,
        gotcha: "Embedding ≠ inheritance. Dog doesn't 'is-a' Animal. You can't pass a Dog where an Animal is expected unless Animal is an interface. The promotion is purely syntactic convenience.",
      },
      {
        title: "The nil interface gotcha",
        sub: "A nil pointer wrapped in an interface is NOT nil — one of Go's most common surprises.",
        concepts: ["nil interface gotcha"],
        body: `<pre><code><span class="kw">type</span> <span class="ty">MyError</span> <span class="kw">struct</span>{ msg <span class="ty">string</span> }
<span class="kw">func</span> (e *<span class="ty">MyError</span>) <span class="fn">Error</span>() <span class="ty">string</span> { <span class="kw">return</span> e.msg }

<span class="kw">func</span> <span class="fn">getError</span>(fail <span class="ty">bool</span>) <span class="ty">error</span> {
    <span class="kw">var</span> err *<span class="ty">MyError</span>  <span class="cm">// typed nil pointer</span>
    <span class="kw">if</span> fail {
        err = &<span class="ty">MyError</span>{<span class="str">"oops"</span>}
    }
    <span class="kw">return</span> err  <span class="cm">// WRONG: returns non-nil interface!</span>
}

err := <span class="fn">getError</span>(<span class="kw">false</span>)
err == <span class="kw">nil</span>  <span class="cm">// false — surprise!</span>

<span class="cm">// Fix: return nil directly</span>
<span class="kw">func</span> <span class="fn">getError</span>(fail <span class="ty">bool</span>) <span class="ty">error</span> {
    <span class="kw">if</span> fail {
        <span class="kw">return</span> &<span class="ty">MyError</span>{<span class="str">"oops"</span>}
    }
    <span class="kw">return</span> <span class="kw">nil</span>  <span class="cm">// correct</span>
}</code></pre>`,
        note: "Rule: never return a typed nil pointer as an interface. Return untyped nil directly, or return the interface type throughout.",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Notification dispatcher",
        difficulty: "medium",
        description: "Build a notification system that can send messages over multiple channels (email, SMS, Slack). A dispatcher accepts any notifier, and a multi-notifier fans out to all of them at once.",
        concepts: ["implicit interfaces", "interface composition", "struct embedding"],
        requirements: [
          "Define a Notifier interface with Send(to, subject, body string) error",
          "Implement EmailNotifier, SMSNotifier, SlackNotifier — each satisfies Notifier implicitly",
          "Create a MultiNotifier struct that embeds a slice of Notifier and also satisfies the interface",
          "Add a LoggedNotifier that embeds any Notifier and logs each send without modifying the originals",
          "Write a Dispatch(n Notifier, ...) function that accepts the narrowest interface it needs",
          "SMSNotifier should use a pointer receiver; verify that passing a value (not pointer) causes a compile error",
        ],
      },
      {
        id: 2,
        title: "Pluggable storage engine",
        difficulty: "medium",
        description: "Design a key-value store where the storage backend is swappable. Support an in-memory backend and an append-only log backend, with a composed interface for stores that also support snapshots.",
        concepts: ["interface composition", "method sets", "nil interface gotcha"],
        requirements: [
          "Define small interfaces: Getter, Setter, Deleter — compose them into a Store interface",
          "Add a separate Snapshotter interface and compose it with Store into PersistentStore",
          "Implement MemStore (satisfies Store) and LogStore (satisfies PersistentStore)",
          "Write a NewStore(persistent bool) Store factory — deliberately trigger the nil interface gotcha, then fix it",
          "All mutating methods must use pointer receivers; verify with: var _ Store = (*MemStore)(nil)",
          "Write a CachedStore that embeds a Store and adds an in-memory read cache via embedding",
        ],
      },
      {
        id: 3,
        title: "Middleware pipeline",
        difficulty: "complex",
        description: "Build a minimal HTTP-inspired handler system with a middleware chain. Each middleware wraps the next handler — composing interfaces and embedding to build powerful behaviour without inheritance.",
        concepts: ["implicit interfaces", "interface composition", "struct embedding", "method sets", "nil interface gotcha"],
        requirements: [
          "Define Handler interface with ServeHTTP(w ResponseWriter, r *Request) using your own minimal types",
          "Define ResponseWriter interface composed from Writer and HeaderWriter smaller interfaces",
          "Implement LoggingMiddleware and AuthMiddleware — each embeds the next Handler and wraps ServeHTTP",
          "Build a Chain(h Handler, middlewares ...func(Handler) Handler) Handler that composes the chain",
          "AuthMiddleware should return a typed nil *AuthMiddleware on config error — demonstrate the nil gotcha in a test then fix it",
          "Add a RecordingResponseWriter struct that embeds ResponseWriter and records the status code — use pointer receiver so mutations stick",
        ],
      },
    ],
  },
  {
    day: 2,
    title: "Error handling deep dive",
    subtitle: "Custom errors, wrapping, sentinel errors, errors.Is/As, panic/recover",
    phase: 1,
    concepts: ["custom error types", "%w wrapping", "errors.Is / errors.As", "sentinel errors", "panic / recover", "error hierarchy"],
    steps: [
      {
        title: "The error interface & custom types",
        sub: "The built-in error interface has one method. Any type that implements it is an error.",
        concepts: ["custom error types"],
        body: `<pre><code><span class="kw">type</span> <span class="ty">error</span> <span class="kw">interface</span> {
    <span class="fn">Error</span>() <span class="ty">string</span>
}

<span class="kw">type</span> <span class="ty">ValidationError</span> <span class="kw">struct</span> {
    Field   <span class="ty">string</span>
    Value   <span class="ty">any</span>
    Message <span class="ty">string</span>
}

<span class="kw">func</span> (e *<span class="ty">ValidationError</span>) <span class="fn">Error</span>() <span class="ty">string</span> {
    <span class="kw">return</span> fmt.<span class="fn">Sprintf</span>(<span class="str">"validation failed on %s=%v: %s"</span>,
        e.Field, e.Value, e.Message)
}

<span class="kw">func</span> <span class="fn">validateAge</span>(age <span class="ty">int</span>) <span class="ty">error</span> {
    <span class="kw">if</span> age < 0 {
        <span class="kw">return</span> &<span class="ty">ValidationError</span>{
            Field: <span class="str">"age"</span>, Value: age,
            Message: <span class="str">"must be non-negative"</span>,
        }
    }
    <span class="kw">return</span> <span class="kw">nil</span>
}</code></pre>`,
        note: "Always use a pointer receiver on custom error types. A value-receiver error can be tricky to compare with errors.As and may copy the data unexpectedly.",
      },
      {
        title: "Error wrapping with %w",
        sub: "Wrap errors as they bubble up to add context without losing the original. Go 1.13+.",
        concepts: ["%w wrapping"],
        body: `<pre><code><span class="cm">// WITHOUT wrapping — caller sees nothing useful</span>
<span class="kw">func</span> <span class="fn">readConfig</span>(path <span class="ty">string</span>) <span class="ty">error</span> {
    _, err := os.<span class="fn">Open</span>(path)
    <span class="kw">if</span> err != <span class="kw">nil</span> { <span class="kw">return</span> err }
    <span class="kw">return</span> <span class="kw">nil</span>
}

<span class="cm">// WITH wrapping — chain of context preserved</span>
<span class="kw">func</span> <span class="fn">readConfig</span>(path <span class="ty">string</span>) <span class="ty">error</span> {
    _, err := os.<span class="fn">Open</span>(path)
    <span class="kw">if</span> err != <span class="kw">nil</span> {
        <span class="kw">return</span> fmt.<span class="fn">Errorf</span>(<span class="str">"readConfig: open %s: %w"</span>, path, err)
    }
    <span class="kw">return</span> <span class="kw">nil</span>
}

<span class="cm">// Result: "loadApp: readConfig: open /etc/app.conf: no such file"</span></code></pre>`,
        note: "%w wraps — the original error is stored inside and reachable via errors.Unwrap. %v formats — the original is lost. Use %w unless you deliberately want to hide the original.",
        gotcha: "Don't wrap at every single call site — only at meaningful boundaries (package edges, external calls). Over-wrapping makes the chain noisy.",
      },
      {
        title: "errors.Is and errors.As",
        sub: "How to inspect a wrapped error chain — the right way to check for specific errors.",
        concepts: ["errors.Is / errors.As"],
        body: `<pre><code><span class="cm">// errors.Is — checks value identity through the chain</span>
<span class="kw">var</span> ErrNotFound = errors.<span class="fn">New</span>(<span class="str">"not found"</span>)

err := fmt.<span class="fn">Errorf</span>(<span class="str">"findUser: %w"</span>, ErrNotFound)
errors.<span class="fn">Is</span>(err, ErrNotFound)  <span class="cm">// true — unwraps chain</span>
err == ErrNotFound             <span class="cm">// false — surface only</span>

<span class="cm">// errors.As — checks type through the chain</span>
<span class="kw">type</span> <span class="ty">DBError</span> <span class="kw">struct</span> { Code <span class="ty">int</span>; Query <span class="ty">string</span> }
<span class="kw">func</span> (e *<span class="ty">DBError</span>) <span class="fn">Error</span>() <span class="ty">string</span> {
    <span class="kw">return</span> fmt.<span class="fn">Sprintf</span>(<span class="str">"db error %d"</span>, e.Code)
}

<span class="kw">var</span> dbErr *<span class="ty">DBError</span>
<span class="kw">if</span> errors.<span class="fn">As</span>(<span class="fn">runQuery</span>(), &dbErr) {
    fmt.<span class="fn">Println</span>(dbErr.Code)   <span class="cm">// 1045</span>
    fmt.<span class="fn">Println</span>(dbErr.Query)  <span class="cm">// "SELECT ..."</span>
}</code></pre>`,
        gotcha: "Never use type assertions (err.(*DBError)) on wrapped errors — this only checks the outermost error and misses everything wrapped inside.",
      },
      {
        title: "Sentinel errors",
        sub: "Package-level error variables used as well-known signals. io.EOF is the classic example.",
        concepts: ["sentinel errors"],
        body: `<pre><code><span class="kw">var</span> (
    ErrNotFound     = errors.<span class="fn">New</span>(<span class="str">"not found"</span>)
    ErrUnauthorized = errors.<span class="fn">New</span>(<span class="str">"unauthorized"</span>)
    ErrRateLimited  = errors.<span class="fn">New</span>(<span class="str">"rate limited"</span>)
)

<span class="cm">// Custom Is() for semantic matching (match on content)</span>
<span class="kw">type</span> <span class="ty">HTTPError</span> <span class="kw">struct</span> { StatusCode <span class="ty">int</span>; Message <span class="ty">string</span> }
<span class="kw">func</span> (e *<span class="ty">HTTPError</span>) <span class="fn">Error</span>() <span class="ty">string</span> { <span class="kw">return</span> e.Message }

<span class="kw">func</span> (e *<span class="ty">HTTPError</span>) <span class="fn">Is</span>(target <span class="ty">error</span>) <span class="ty">bool</span> {
    t, ok := target.(*<span class="ty">HTTPError</span>)
    <span class="kw">if</span> !ok { <span class="kw">return</span> <span class="kw">false</span> }
    <span class="kw">return</span> e.StatusCode == t.StatusCode
}

err := &<span class="ty">HTTPError</span>{StatusCode: 404, Message: <span class="str">"not found"</span>}
errors.<span class="fn">Is</span>(err, &<span class="ty">HTTPError</span>{StatusCode: 404})  <span class="cm">// true</span></code></pre>`,
        gotcha: "Sentinel errors create a public API contract. Once exported, you can never change their message string without potentially breaking callers.",
        good: "Name sentinels with the Err prefix (ErrNotFound, not NotFoundError). This is a strong Go convention and makes grep-ability excellent.",
      },
      {
        title: "panic and recover",
        sub: "panic is not for errors. It signals programmer mistakes or truly unrecoverable states.",
        concepts: ["panic / recover"],
        body: `<pre><code><span class="cm">// panic: for conditions that should NEVER happen</span>
<span class="kw">func</span> <span class="fn">mustPositive</span>(n <span class="ty">int</span>) <span class="ty">int</span> {
    <span class="kw">if</span> n <= 0 {
        <span class="fn">panic</span>(fmt.<span class="fn">Sprintf</span>(<span class="str">"mustPositive: got %d"</span>, n))
    }
    <span class="kw">return</span> n
}

<span class="cm">// recover: ONLY useful inside a deferred function</span>
<span class="kw">func</span> <span class="fn">safeExecute</span>(fn <span class="kw">func</span>()) (err <span class="ty">error</span>) {
    <span class="kw">defer func</span>() {
        <span class="kw">if</span> r := <span class="fn">recover</span>(); r != <span class="kw">nil</span> {
            err = fmt.<span class="fn">Errorf</span>(<span class="str">"panic recovered: %v"</span>, r)
        }
    }()
    <span class="fn">fn</span>()
    <span class="kw">return</span> <span class="kw">nil</span>
}</code></pre>`,
        gotcha: "Never use recover to swallow panics silently. Always log the stack trace (debug.Stack()) and convert to an error.",
      },
      {
        title: "Building an error hierarchy",
        sub: "Real services need structured errors with codes, context, and retryability.",
        concepts: ["error hierarchy"],
        body: `<pre><code><span class="kw">type</span> <span class="ty">ErrorCode</span> <span class="ty">string</span>
<span class="kw">const</span> (
    CodeNotFound     <span class="ty">ErrorCode</span> = <span class="str">"NOT_FOUND"</span>
    CodeUnauthorized <span class="ty">ErrorCode</span> = <span class="str">"UNAUTHORIZED"</span>
    CodeInternal     <span class="ty">ErrorCode</span> = <span class="str">"INTERNAL"</span>
)

<span class="kw">type</span> <span class="ty">AppError</span> <span class="kw">struct</span> {
    Code      <span class="ty">ErrorCode</span>
    Message   <span class="ty">string</span>
    Err       <span class="ty">error</span>
    Retryable <span class="ty">bool</span>
}

<span class="kw">func</span> (e *<span class="ty">AppError</span>) <span class="fn">Error</span>() <span class="ty">string</span> {
    <span class="kw">return</span> fmt.<span class="fn">Sprintf</span>(<span class="str">"[%s] %s: %v"</span>, e.Code, e.Message, e.Err)
}
<span class="kw">func</span> (e *<span class="ty">AppError</span>) <span class="fn">Unwrap</span>() <span class="ty">error</span> { <span class="kw">return</span> e.Err }

<span class="cm">// HTTP handler maps codes to status cleanly</span>
<span class="kw">func</span> <span class="fn">httpStatus</span>(err <span class="ty">error</span>) <span class="ty">int</span> {
    <span class="kw">var</span> ae *<span class="ty">AppError</span>
    <span class="kw">if</span> !errors.<span class="fn">As</span>(err, &ae) { <span class="kw">return</span> 500 }
    <span class="kw">switch</span> ae.Code {
    <span class="kw">case</span> CodeNotFound:     <span class="kw">return</span> 404
    <span class="kw">case</span> CodeUnauthorized: <span class="kw">return</span> 401
    <span class="kw">default</span>:              <span class="kw">return</span> 500
    }
}</code></pre>`,
        good: "Implement Unwrap() error manually when wrapping in a struct field — %w only works inside fmt.Errorf. Without Unwrap(), errors.Is and errors.As can't see inside your struct.",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Validated config loader",
        difficulty: "medium",
        description: "Build a multi-step config loader that reads from a file, parses fields, and validates them. Every layer wraps errors with context, and callers use errors.Is / errors.As to branch on specific failures.",
        concepts: ["custom error types", "%w wrapping", "errors.Is / errors.As", "sentinel errors"],
        requirements: [
          "Define sentinel errors: ErrConfigNotFound, ErrConfigInvalid",
          "Define a FieldError struct carrying field name, bad value, and reason — implement Unwrap() so it wraps ErrConfigInvalid",
          "Write loadFile, parseConfig, and validateConfig — each wraps the error from the layer below with fmt.Errorf",
          "In main, use errors.Is to detect missing file and errors.As to extract *FieldError and print the bad field name",
          "Verify: bare == comparison fails to match through the chain but errors.Is succeeds — demonstrate both in a test",
          "Print the full error chain on failure — it should read like a breadcrumb path",
        ],
      },
      {
        id: 2,
        title: "HTTP client with retry",
        difficulty: "medium",
        description: "Write an HTTP client wrapper that retries on transient errors, stops immediately on permanent ones, and exposes a structured error type callers can inspect.",
        concepts: ["custom error types", "errors.Is — custom Is()", "sentinel errors", "error hierarchy"],
        requirements: [
          "Define an HTTPError struct with StatusCode, URL, and Retryable bool",
          "Implement a custom Is(target error) bool method that matches on StatusCode",
          "Define sentinel families: ErrRateLimited (429), ErrUnauthorized (401), ErrServerError (5xx)",
          "Write Get(url string, maxRetries int) ([]byte, error) that retries only when Retryable is true",
          "After exhausting retries, return a final error wrapping all attempt errors — callers can still errors.As through",
          "Write tests using net/http/httptest that returns 429 three times then 200 — verify retry count and final success",
        ],
      },
      {
        id: 3,
        title: "Safe job runner",
        difficulty: "complex",
        description: "Build a concurrent job runner that executes tasks in goroutines, recovers from panics, collects all errors, and surfaces them through a structured AppError hierarchy.",
        concepts: ["error hierarchy", "%w wrapping", "errors.Is / errors.As", "panic / recover", "sentinel errors"],
        requirements: [
          "Define AppError with ErrorCode, Message, Retryable bool, and Unwrap() — with constructors Internal(), Timeout(), InvalidInput()",
          "Define a MultiError type holding a slice of errors with Unwrap() []error (Go 1.20+ multi-unwrap)",
          "Write RunJobs(jobs []Job) error — runs each job in a goroutine, wraps panics in Internal with stack trace",
          "A recover() guard inside each goroutine must convert panics to AppError{Code: CodeInternal}",
          "Caller uses errors.As on the returned MultiError to find all *AppErrors and count how many are retryable",
          "Write a test where 3 of 5 jobs panic, 1 returns Timeout, 1 succeeds — assert MultiError contains exactly 4 errors",
        ],
      },
    ],
  },
  {
    day: 3,
    title: "Goroutines internals",
    subtitle: "GMP scheduler, stacks, GOMAXPROCS, work stealing, leaks, debugging",
    phase: 1,
    concepts: ["GMP model", "goroutine stacks", "GOMAXPROCS", "work stealing", "goroutine leaks", "runtime debugging"],
    steps: [
      {
        title: "The GMP model: G, M, and P",
        sub: "Go's runtime scheduler maps goroutines (G) onto OS threads (M) using logical processors (P). This is the M:N threading model.",
        concepts: ["GMP model"],
        body: `<pre><code><span class="cm">// GOMAXPROCS=2 means 2 Ps, each bound to one M at a time</span>
<span class="cm">// P0: [G1 running] [G2, G3, G4 in local run queue]</span>
<span class="cm">// P1: [G5 running] [G6, G7 in local run queue]</span>
<span class="cm">// Global run queue: [G8, G9, G10 ...]</span>
<span class="cm">// M0 bound to P0, M1 bound to P1 — running in parallel</span>

<span class="cm">// G = goroutine: lightweight, 2KB initial stack</span>
<span class="cm">// M = machine:   real OS thread, kernel schedules these</span>
<span class="cm">// P = processor: scheduling context, holds local run queue</span></code></pre>`,
        note: "P count controls parallelism, M count is elastic. When a G blocks on a syscall, the runtime unbinds P from M so P can find another M — keeping all Ps busy.",
      },
      {
        title: "Goroutine stacks: growable and shrinkable",
        sub: "Unlike OS threads (1–8 MB fixed stacks), goroutines start tiny and grow on demand.",
        concepts: ["goroutine stacks"],
        body: `<pre><code><span class="cm">// Stack growth: contiguous copy model</span>
<span class="cm">// 1. Detect overflow via "stack guard" pointer at bottom</span>
<span class="cm">// 2. Allocate new, larger stack (typically 2x)</span>
<span class="cm">// 3. Copy all frames over, rewrite all pointers</span>
<span class="cm">// 4. Resume goroutine on new stack</span>

<span class="kw">func</span> <span class="fn">deepRecursion</span>(n <span class="ty">int</span>) <span class="ty">int</span> {
    <span class="kw">if</span> n == 0 { <span class="kw">return</span> 0 }
    <span class="kw">return</span> <span class="fn">deepRecursion</span>(n-1) + 1
    <span class="cm">// stack grows automatically — no overflow</span>
}

<span class="cm">// Initial: 2 KB | Max: 1 GB | OS thread: 1–8 MB fixed</span></code></pre>`,
        gotcha: "Never hold a raw pointer into another goroutine's stack from outside. When the stack is copied, the pointer becomes invalid.",
      },
      {
        title: "GOMAXPROCS and the container gotcha",
        sub: "GOMAXPROCS sets the number of OS threads that can execute Go code simultaneously.",
        concepts: ["GOMAXPROCS"],
        body: `<pre><code>n := runtime.<span class="fn">GOMAXPROCS</span>(0)   <span class="cm">// 0 = query without changing</span>
old := runtime.<span class="fn">GOMAXPROCS</span>(4)  <span class="cm">// set to 4, returns old value</span>

<span class="cm">// Container gotcha: Go reads from HOST CPU count, not cgroup limit</span>
<span class="cm">// Container with 0.5 CPU on a 64-core host → GOMAXPROCS=64</span>
<span class="cm">// Result: 64 threads contending for 0.5 CPU → huge context switching</span>

<span class="cm">// Fix: automaxprocs reads cgroup quota and sets GOMAXPROCS correctly</span>
<span class="kw">import</span> _ <span class="str">"go.uber.org/automaxprocs"</span></code></pre>`,
        gotcha: "In Kubernetes or Docker with CPU limits set, always use automaxprocs. This single import can 2-3x throughput in containerised services.",
      },
      {
        title: "Work stealing",
        sub: "When a P runs out of goroutines, it steals half the run queue from another P instead of going idle.",
        concepts: ["work stealing"],
        body: `<pre><code><span class="cm">// Scheduler decision loop per P (simplified):</span>
<span class="cm">// 1. Check local run queue → run a G if one exists</span>
<span class="cm">// 2. Check global run queue (every 61 ticks — starvation prevention)</span>
<span class="cm">// 3. Check network poller for ready I/O goroutines</span>
<span class="cm">// 4. Work steal: pick random P, steal half its run queue</span>
<span class="cm">// 5. If still no work, park the M (give up P)</span>

<span class="cm">// Go 1.14+: async preemption via SIGURG</span>
<span class="cm">// Tight CPU loops CAN be preempted — unlike older Go</span>

runtime.<span class="fn">Gosched</span>()  <span class="cm">// cooperative yield — rarely needed post-1.14</span></code></pre>`,
        note: "Steals from the tail of the victim's queue. The victim keeps hot, recently-added work. The stealer gets the cold tail end. This minimises cache contention.",
      },
      {
        title: "Goroutine leaks",
        sub: "A leaked goroutine is one that is started but never exits — it sits blocked forever, holding memory and resources.",
        concepts: ["goroutine leaks"],
        body: `<pre><code><span class="cm">// Leak: channel nobody writes to</span>
<span class="kw">func</span> <span class="fn">leak</span>() {
    ch := <span class="fn">make</span>(<span class="kw">chan</span> <span class="ty">int</span>)
    <span class="kw">go func</span>() { v := <-ch; fmt.<span class="fn">Println</span>(v) }()
    <span class="cm">// ch goes out of scope — goroutine blocked forever</span>
}

<span class="cm">// Fix: always pass context, select on done</span>
<span class="kw">func</span> <span class="fn">noLeak</span>(ctx context.<span class="ty">Context</span>) {
    <span class="kw">go func</span>() {
        <span class="kw">for</span> {
            <span class="kw">select</span> {
            <span class="kw">case</span> <-ctx.<span class="fn">Done</span>():
                <span class="kw">return</span>  <span class="cm">// clean exit</span>
            <span class="kw">default</span>:
                <span class="fn">doWork</span>()
            }
        }
    }()
}

runtime.<span class="fn">NumGoroutine</span>()  <span class="cm">// count — rising steadily = leak</span></code></pre>`,
        gotcha: "The runtime never forcibly terminates a goroutine — only return, panic, or runtime.Goexit() can end one. Every goroutine you start must have a clear exit path.",
      },
      {
        title: "Runtime debugging",
        sub: "The runtime exposes hooks to observe goroutine behaviour in production without stopping the program.",
        concepts: ["runtime debugging"],
        body: `<pre><code><span class="cm">// Dump all goroutine stacks</span>
buf := <span class="fn">make</span>([]<span class="ty">byte</span>, 1<<20)
n := runtime.<span class="fn">Stack</span>(buf, <span class="kw">true</span>)
fmt.<span class="fn">Printf</span>(<span class="str">"%s"</span>, buf[:n])

<span class="cm">// Scheduler tracing — run with:</span>
<span class="cm">// GODEBUG=schedtrace=1000 ./myprogram</span>
<span class="cm">// SCHED 1000ms: gomaxprocs=8 idleprocs=6 threads=10</span>
<span class="cm">//               runqueue=0 [2 0 0 0 0 0 0 0]</span>

<span class="cm">// pprof goroutine profile (production-safe)</span>
<span class="kw">import</span> _ <span class="str">"net/http/pprof"</span>
<span class="cm">// GET /debug/pprof/goroutine?debug=2</span>

<span class="cm">// goleak in tests</span>
<span class="kw">func</span> <span class="fn">TestSomething</span>(t *testing.<span class="ty">T</span>) {
    <span class="kw">defer</span> goleak.<span class="fn">VerifyNone</span>(t)
}</code></pre>`,
        good: "The pprof goroutine endpoint is the most useful production debugging tool for concurrency issues. Enable it on every service — just ensure the port isn't publicly reachable.",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Goroutine pool with work stealing simulation",
        difficulty: "medium",
        description: "Build a worker pool that distributes jobs across N goroutines. Each worker has its own local queue. When idle, it steals from others — mirroring Go's own scheduler internals.",
        concepts: ["GMP model", "goroutine leaks", "GOMAXPROCS"],
        requirements: [
          "Create a WorkerPool with N workers, each running in its own goroutine",
          "Each worker drains its local channel; when empty it tries to steal from a random peer",
          "Use context.Context for shutdown — all goroutines must exit cleanly on cancel",
          "Add a runtime.NumGoroutine() assertion in a test: before pool start, after start, after cancel",
          "Verify with goleak.VerifyNone(t) that no goroutines leak after shutdown",
          "Print GOMAXPROCS at startup; document what automaxprocs would change",
        ],
      },
      {
        id: 2,
        title: "Stack depth profiler",
        difficulty: "medium",
        description: "Write a tool that spawns goroutines with varying recursive depths, captures their stacks via runtime.Stack, parses the output, and reports the deepest call chains.",
        concepts: ["goroutine stacks", "runtime debugging"],
        requirements: [
          "Spawn 20 goroutines each recursing to a different depth (1–20)",
          "Use runtime.Stack(buf, true) to capture all stacks mid-execution",
          "Parse the output to extract goroutine IDs and their current stack depth",
          "Report: goroutine ID, depth, and top frame function name",
          "Demonstrate stack growth is automatic — no explicit size hint needed",
          "Add a GODEBUG=schedtrace=500 run and document what each field means",
        ],
      },
      {
        id: 3,
        title: "Leak detector middleware",
        difficulty: "complex",
        description: "Build an HTTP middleware that tracks goroutine count before and after each request, alerts on requests that leak goroutines, and exposes a /debug/goroutines endpoint with full stack traces.",
        concepts: ["goroutine leaks", "runtime debugging", "GOMAXPROCS", "goroutine stacks"],
        requirements: [
          "Middleware records runtime.NumGoroutine() before ServeHTTP and after",
          "If count after > count before + threshold, log a warning with the request path and delta",
          "Expose GET /debug/goroutines that returns runtime.Stack output as plain text",
          "Expose GET /debug/stats returning GOMAXPROCS, goroutine count, and thread count as JSON",
          "Write a test that intentionally leaks goroutines in a handler and asserts the middleware detects it",
          "Use goleak.VerifyNone(t) to confirm the test itself is clean after the leaky handler is fixed",
        ],
      },
    ],
  },
];

export function getDay(n: number): Day | undefined {
  return days.find((d) => d.day === n);
}

export function getPhaseForDay(n: number) {
  return phases.find((p) => n >= p.days[0] && n <= p.days[1]);
}

export const embeddingDeepDiveSteps: import('./days').Step[] = [
  {
    title: "Shadowing — overriding promoted methods",
    sub: "When the outer struct defines a method with the same name as an embedded one, the outer method wins. This is how you override behaviour without inheritance.",
    concepts: ["struct embedding", "shadowing"],
    body: `<pre><code><span class="kw">type</span> <span class="ty">Base</span> <span class="kw">struct</span>{}
<span class="kw">func</span> (b <span class="ty">Base</span>) <span class="fn">Describe</span>() <span class="ty">string</span> { <span class="kw">return</span> <span class="str">"I am Base"</span> }
<span class="kw">func</span> (b <span class="ty">Base</span>) <span class="fn">Name</span>()     <span class="ty">string</span> { <span class="kw">return</span> <span class="str">"Base"</span> }

<span class="kw">type</span> <span class="ty">Child</span> <span class="kw">struct</span>{ <span class="ty">Base</span> }

<span class="cm">// Shadow Describe — Child's version wins on Child values</span>
<span class="kw">func</span> (c <span class="ty">Child</span>) <span class="fn">Describe</span>() <span class="ty">string</span> { <span class="kw">return</span> <span class="str">"I am Child"</span> }

c := <span class="ty">Child</span>{}
c.<span class="fn">Describe</span>()       <span class="cm">// "I am Child"   — shadowed</span>
c.<span class="fn">Name</span>()           <span class="cm">// "Base"         — promoted, not shadowed</span>
c.Base.<span class="fn">Describe</span>()  <span class="cm">// "I am Base"    — explicit access still works</span>

<span class="cm">// ── The shadowing does NOT affect interface satisfaction ──</span>
<span class="kw">type</span> <span class="ty">Describer</span> <span class="kw">interface</span>{ <span class="fn">Describe</span>() <span class="ty">string</span> }

<span class="kw">var</span> d <span class="ty">Describer</span> = <span class="ty">Child</span>{}
d.<span class="fn">Describe</span>()  <span class="cm">// "I am Child" — Child's method satisfies the interface</span>

<span class="cm">// But Base also satisfies Describer independently:</span>
<span class="kw">var</span> b <span class="ty">Describer</span> = <span class="ty">Base</span>{}
b.<span class="fn">Describe</span>()  <span class="cm">// "I am Base"</span></code></pre>`,
    note: "This is the Go idiom for decorator/override patterns. Embed the base type, reimplement only the methods you want to change, and call c.Base.Method() to explicitly reach the original — equivalent to super() in other languages.",
    gotcha: "Shadowing only applies to the exact outer type. If you assign a Child to a Describer interface variable, calling Describe() via the interface dispatches to Child.Describe() — correct. But if you pass c.Base as a Describer, it uses Base.Describe(). There is no virtual dispatch — the method set is resolved at the type, not at runtime.",
  },
  {
    title: "Pointer vs value embedding",
    sub: "Embedding *T (pointer) vs T (value) has different implications for mutability, nil safety, and interface satisfaction.",
    concepts: ["struct embedding", "method sets"],
    body: `<pre><code><span class="kw">type</span> <span class="ty">Engine</span> <span class="kw">struct</span>{ Running <span class="ty">bool</span> }
<span class="kw">func</span> (e *<span class="ty">Engine</span>) <span class="fn">Start</span>()          { e.Running = <span class="kw">true</span> }
<span class="kw">func</span> (e  <span class="ty">Engine</span>) <span class="fn">Status</span>() <span class="ty">string</span> {
    <span class="kw">if</span> e.Running { <span class="kw">return</span> <span class="str">"on"</span> }; <span class="kw">return</span> <span class="str">"off"</span>
}

<span class="cm">// ── Value embedding ───────────────────────────────────────</span>
<span class="kw">type</span> <span class="ty">CarV</span> <span class="kw">struct</span>{ <span class="ty">Engine</span> }

cv := <span class="ty">CarV</span>{}
cv.<span class="fn">Start</span>()               <span class="cm">// ok — Go auto-takes &amp;cv.Engine</span>
fmt.<span class="fn">Println</span>(cv.<span class="fn">Status</span>()) <span class="cm">// "on"</span>

<span class="cm">// ── Pointer embedding ─────────────────────────────────────</span>
<span class="kw">type</span> <span class="ty">CarP</span> <span class="kw">struct</span>{ *<span class="ty">Engine</span> }

shared := &<span class="ty">Engine</span>{}
c1 := <span class="ty">CarP</span>{Engine: shared}
c2 := <span class="ty">CarP</span>{Engine: shared}  <span class="cm">// both share the same Engine</span>

c1.<span class="fn">Start</span>()
fmt.<span class="fn">Println</span>(c2.<span class="fn">Status</span>())  <span class="cm">// "on" — mutation visible through c2!</span>

<span class="cm">// ── Nil pointer embedding danger ─────────────────────────</span>
<span class="kw">var</span> c3 <span class="ty">CarP</span>     <span class="cm">// Engine pointer is nil</span>
c3.<span class="fn">Status</span>()    <span class="cm">// PANIC: nil pointer dereference</span></code></pre>`,
    good: "Use pointer embedding when the embedded type is large (avoid copies), when multiple outer structs need to share one instance, or when the embedded type contains a sync.Mutex (which must never be copied).",
  },
  {
    title: "The diamond problem — name collision",
    sub: "When two embedded types both promote a method with the same name, Go refuses to promote either. You must disambiguate explicitly.",
    concepts: ["struct embedding", "interface composition"],
    body: `<pre><code><span class="kw">type</span> <span class="ty">Logger</span>  <span class="kw">struct</span>{}
<span class="kw">type</span> <span class="ty">Auditor</span> <span class="kw">struct</span>{}

<span class="kw">func</span> (<span class="ty">Logger</span>)  <span class="fn">Log</span>(msg <span class="ty">string</span>) { fmt.<span class="fn">Println</span>(<span class="str">"LOG:"</span>, msg) }
<span class="kw">func</span> (<span class="ty">Auditor</span>) <span class="fn">Log</span>(msg <span class="ty">string</span>) { fmt.<span class="fn">Println</span>(<span class="str">"AUDIT:"</span>, msg) }

<span class="kw">type</span> <span class="ty">Service</span> <span class="kw">struct</span>{ <span class="ty">Logger</span>; <span class="ty">Auditor</span> }

s := <span class="ty">Service</span>{}
s.<span class="fn">Log</span>(<span class="str">"hello"</span>)         <span class="cm">// COMPILE ERROR: ambiguous selector s.Log</span>
s.Logger.<span class="fn">Log</span>(<span class="str">"hello"</span>)   <span class="cm">// ok — explicit</span>
s.Auditor.<span class="fn">Log</span>(<span class="str">"hello"</span>)  <span class="cm">// ok — explicit</span>

<span class="cm">// Fix: shadow with an outer method that calls both</span>
<span class="kw">func</span> (s <span class="ty">Service</span>) <span class="fn">Log</span>(msg <span class="ty">string</span>) {
    s.Logger.<span class="fn">Log</span>(msg)
    s.Auditor.<span class="fn">Log</span>(msg)
}

<span class="cm">// ── Interface satisfaction with collision ─────────────────</span>
<span class="kw">type</span> <span class="ty">Logable</span> <span class="kw">interface</span>{ <span class="fn">Log</span>(<span class="ty">string</span>) }
<span class="kw">var</span> _ <span class="ty">Logable</span> = <span class="ty">Service</span>{}  <span class="cm">// compile error without the outer Log!</span></code></pre>`,
    gotcha: "The collision prevents interface satisfaction too — Service does NOT satisfy Logable unless you add the outer Log method. The compiler error is accurate but terse. Depth wins over breadth: a direct field always beats an embedded one at the same depth.",
  },
  {
    title: "Embedding interfaces inside structs",
    sub: "You can embed an interface type in a struct. Used for mocking, decoration, and forward-compatible API design.",
    concepts: ["struct embedding", "implicit interfaces"],
    body: `<pre><code><span class="kw">type</span> <span class="ty">Store</span> <span class="kw">interface</span> {
    <span class="fn">Get</span>(key <span class="ty">string</span>) <span class="ty">string</span>
    <span class="fn">Set</span>(key, val <span class="ty">string</span>)
    <span class="fn">Delete</span>(key <span class="ty">string</span>)
}

<span class="cm">// Override only the method you care about in a test</span>
<span class="kw">type</span> <span class="ty">GetOnlyStore</span> <span class="kw">struct</span> {
    <span class="ty">Store</span>
    getFunc <span class="kw">func</span>(<span class="ty">string</span>) <span class="ty">string</span>
}
<span class="kw">func</span> (s <span class="ty">GetOnlyStore</span>) <span class="fn">Get</span>(key <span class="ty">string</span>) <span class="ty">string</span> {
    <span class="kw">return</span> s.<span class="fn">getFunc</span>(key)
}

mock := <span class="ty">GetOnlyStore</span>{getFunc: <span class="kw">func</span>(k <span class="ty">string</span>) <span class="ty">string</span> { <span class="kw">return</span> <span class="str">"mocked"</span> }}
mock.<span class="fn">Get</span>(<span class="str">"x"</span>)      <span class="cm">// "mocked"</span>
mock.<span class="fn">Set</span>(<span class="str">"x"</span>,<span class="str">"y"</span>)  <span class="cm">// PANIC — nil embedded interface</span>

<span class="cm">// Forward-compatible decorator: embed the interface,</span>
<span class="cm">// override only what you need, delegate the rest</span>
<span class="kw">type</span> <span class="ty">CachedStore</span> <span class="kw">struct</span> {
    <span class="ty">Store</span>
    cache <span class="kw">map</span>[<span class="ty">string</span>]<span class="ty">string</span>
}
<span class="kw">func</span> (c *<span class="ty">CachedStore</span>) <span class="fn">Get</span>(key <span class="ty">string</span>) <span class="ty">string</span> {
    <span class="kw">if</span> v, ok := c.cache[key]; ok { <span class="kw">return</span> v }
    v := c.Store.<span class="fn">Get</span>(key)
    c.cache[key] = v
    <span class="kw">return</span> v
}
<span class="cm">// Set and Delete delegate automatically to c.Store</span></code></pre>`,
    gotcha: "Any call to an unoverridden method on a nil embedded interface panics at runtime, not compile time. Either always initialise the embedded interface, or use a proper mock library.",
    good: "The CachedStore decorator pattern is used extensively in Go's stdlib — http.ResponseWriter wrappers, io.Reader decorators, and test helpers all follow this exact shape.",
  },
  {
    title: "Embedding and JSON / struct tags",
    sub: "Embedded struct fields are promoted to the outer struct's JSON representation — including their tags. Powerful but with surprising edge cases.",
    concepts: ["struct embedding"],
    body: `<pre><code><span class="kw">type</span> <span class="ty">Timestamps</span> <span class="kw">struct</span> {
    CreatedAt time.<span class="ty">Time</span> <span class="str">\`json:"created_at"\`</span>
    UpdatedAt time.<span class="ty">Time</span> <span class="str">\`json:"updated_at"\`</span>
}

<span class="kw">type</span> <span class="ty">User</span> <span class="kw">struct</span> {
    ID   <span class="ty">int</span>    <span class="str">\`json:"id"\`</span>
    Name <span class="ty">string</span> <span class="str">\`json:"name"\`</span>
    <span class="ty">Timestamps</span>   <span class="cm">// promoted: created_at and updated_at at top level</span>
}
<span class="cm">// {"id":1,"name":"Alice","created_at":"...","updated_at":"..."}</span>

<span class="cm">// Named field = nesting instead</span>
<span class="kw">type</span> <span class="ty">UserNested</span> <span class="kw">struct</span> {
    ID         <span class="ty">int</span>        <span class="str">\`json:"id"\`</span>
    Timestamps <span class="ty">Timestamps</span> <span class="str">\`json:"timestamps"\`</span>
}
<span class="cm">// {"id":1,"timestamps":{"created_at":"...","updated_at":"..."}}</span>

<span class="cm">// ── Silent collision ──────────────────────────────────────</span>
<span class="kw">type</span> <span class="ty">A</span> <span class="kw">struct</span>{ Name <span class="ty">string</span> <span class="str">\`json:"name"\`</span> }
<span class="kw">type</span> <span class="ty">B</span> <span class="kw">struct</span>{ Name <span class="ty">string</span> <span class="str">\`json:"name"\`</span> }
<span class="kw">type</span> <span class="ty">C</span> <span class="kw">struct</span>{ <span class="ty">A</span>; <span class="ty">B</span> }
<span class="cm">// encoding/json silently drops BOTH "name" fields — no error!</span></code></pre>`,
    gotcha: "The silent JSON collision is one of the nastiest bugs in Go. Two embedded structs share a field name, you marshal to JSON, the field vanishes — no error anywhere. Always test JSON output shapes when using multi-embedding.",
  },
  {
    title: "Real-world patterns",
    sub: "Three patterns from production Go code that use embedding in non-obvious ways.",
    concepts: ["struct embedding", "method sets", "implicit interfaces"],
    body: `<pre><code><span class="cm">// ── Pattern 1: sync.Mutex embedding ──────────────────────</span>
<span class="kw">type</span> <span class="ty">SafeMap</span> <span class="kw">struct</span> {
    sync.<span class="ty">RWMutex</span>              <span class="cm">// Lock/RLock promoted</span>
    data <span class="kw">map</span>[<span class="ty">string</span>]<span class="ty">string</span>
}
m := &<span class="ty">SafeMap</span>{data: <span class="fn">make</span>(<span class="kw">map</span>[<span class="ty">string</span>]<span class="ty">string</span>)}
m.<span class="fn">Lock</span>(); m.data[<span class="str">"k"</span>] = <span class="str">"v"</span>; m.<span class="fn">Unlock</span>()
<span class="cm">// NEVER copy SafeMap by value — go vet catches this</span>

<span class="cm">// ── Pattern 2: http.ResponseWriter spy ────────────────────</span>
<span class="kw">type</span> <span class="ty">StatusRecorder</span> <span class="kw">struct</span> {
    http.<span class="ty">ResponseWriter</span>
    Status <span class="ty">int</span>
}
<span class="kw">func</span> (r *<span class="ty">StatusRecorder</span>) <span class="fn">WriteHeader</span>(code <span class="ty">int</span>) {
    r.Status = code
    r.ResponseWriter.<span class="fn">WriteHeader</span>(code)
}
<span class="cm">// Captures status code in middleware without reimplementing</span>
<span class="cm">// the full ResponseWriter — you built this in Day 1 Task 3</span>

<span class="cm">// ── Pattern 3: optional capability detection ───────────────</span>
<span class="kw">type</span> <span class="ty">Flusher</span> <span class="kw">interface</span>{ <span class="fn">Flush</span>() }

<span class="kw">func</span> <span class="fn">tryFlush</span>(w http.<span class="ty">ResponseWriter</span>) {
    <span class="kw">if</span> f, ok := w.(<span class="ty">Flusher</span>); ok {
        f.<span class="fn">Flush</span>()
    }
}
<span class="cm">// http.Flusher, http.Hijacker follow this pattern —</span>
<span class="cm">// optional capabilities expressed as small interfaces</span></code></pre>`,
    gotcha: "sync.Mutex and anything containing one must never be copied after first use. Embedding a mutex is fine and idiomatic, but the containing struct must always be used via pointer.",
  },
];
