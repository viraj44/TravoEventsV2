using Microsoft.AspNetCore.Mvc;

namespace EventManagerMVC.Controllers
{
    public class PassController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Scan()
        {
            return View();
        }


    }
}
