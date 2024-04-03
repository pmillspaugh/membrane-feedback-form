import { nodes } from "membrane";

interface Req {
  body: string;
  method: string;
}

export async function endpoint(req: Req) {
  switch (req.method) {
    case "POST":
      return await handleFormSubmission(JSON.parse(req.body));
    case "GET":
      return await serveFeedbackForm();
    default:
      return JSON.stringify({
        status: 405,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "method not allowed" }),
      });
  }
}

interface FeedbackForm {
  email?: string;
  feedback: string;
  url: string;
}

async function handleFormSubmission(form: FeedbackForm) {
  const { email, feedback, url } = form;

  const subject = `Garden thoughts from ${email ?? "anonymous reader"}`;
  const body = `Thoughts on ${url}:\n${feedback}`;
  await nodes.email.send({ subject, body }).$invoke();

  return JSON.stringify({
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "feedback received!" }),
  });
}

async function serveFeedbackForm() {
  return JSON.stringify({
    status: 200,
    headers: { "Content-Type": "text/html" },
    body: `
      <html>
        <body>
          <h1>Blog feedback form</h1>
          <p>This form submits feedback to a membrane program I wrote for <a href="https://petemillspaugh.com">petemillspaugh.com</a> and notifies me via email.</p>
          <p>The code is <a href="https://github.com/pmillspaugh/membrane-feedback-form">public</a>. I also wrote a <a href="https://www.petemillspaugh.com/membrane-feedback-form">blog post</a> and recorded a <a href="https://x.com/pete_millspaugh/status/1774581809558278517?s=20">demo on Twitter</a> if you're interested in digging deeper.</p>
          <form method="POST" action="https://studio-878-reserve-690-drawer-792-hat.hook.membrane.io">
            <label for="email">Your email:</label><br>
            <input type="email" id="email" name="email"><br><br>
            <label for="feedback">Your thoughts:</label><br>
            <textarea id="feedback" name="feedback" required></textarea><br><br>
            <input type="submit" value="Submit">
          </form>
        </body>
      </html>
    `,
  });
}
